const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions');
const { 
  isWeekend, 
  format, 
  subDays, 
  addDays,
  addMonths,
  getDaysInMonth,
  startOfMonth,
  endOfMonth,
  getDay
} = require('date-fns');

const bankHolidays = require('./bankHolidays.json');

initializeApp();
const db = getFirestore();
const messaging = getMessaging();

function isBankHoliday(date, region) {
  const dateStr = format(date, 'yyyy-MM-dd');
  return bankHolidays.some(
    (bh) => bh.date === dateStr && bh.regions.includes(region)
  );
}

function getPreviousWorkingDay(date, region) {
  let tempDate = new Date(date);
  while (isWeekend(tempDate) || isBankHoliday(tempDate, region)) {
    tempDate = subDays(tempDate, 1);
  }
  return tempDate;
}

function getRawPaydayCandidate(config, year, month) {
  const baseDate = new Date(year, month, 1);

  if (config.type === 'fixed') {
    const fixedDay = config.fixedDay ?? 25;
    const maxDays = getDaysInMonth(baseDate);
    const targetDay = Math.min(fixedDay, maxDays);
    return new Date(year, month, targetDay);
  } else {
    const { occurrence, dayOfWeek } = config.nthWeekday ?? { occurrence: 'last', dayOfWeek: 5 };
    const monthStart = startOfMonth(baseDate);
    const monthEnd = endOfMonth(baseDate);

    if (occurrence === 'last') {
      let tempDate = monthEnd;
      while (getDay(tempDate) !== dayOfWeek) {
        tempDate = subDays(tempDate, 1);
      }
      return tempDate;
    } else {
      let tempDate = monthStart;
      while (getDay(tempDate) !== dayOfWeek) {
        tempDate = addDays(tempDate, 1);
      }

      let weeksToAdd = 0;
      if (occurrence === 'second') weeksToAdd = 1;
      else if (occurrence === 'third') weeksToAdd = 2;
      else if (occurrence === 'fourth') weeksToAdd = 3;

      const candidate = addDays(tempDate, weeksToAdd * 7);
      if (candidate.getMonth() !== month) {
        return tempDate;
      }
      return candidate;
    }
  }
}

function calculateNextPayday(config, region, referenceDate) {
  const refDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  let year = refDate.getFullYear();
  let month = refDate.getMonth();

  const currentMonthRaw = getRawPaydayCandidate(config, year, month);
  const currentMonthAdjusted = getPreviousWorkingDay(currentMonthRaw, region);

  const diffTime = currentMonthAdjusted.getTime() - refDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= 0) {
    return currentMonthAdjusted;
  }

  const nextMonthDate = addMonths(refDate, 1);
  const nextMonthRaw = getRawPaydayCandidate(config, nextMonthDate.getFullYear(), nextMonthDate.getMonth());
  return getPreviousWorkingDay(nextMonthRaw, region);
}

function getNotificationType(config, region, today) {
  const refDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const nextPayday = calculateNextPayday(config, region, refDate);
  
  const diffTime = nextPayday.getTime() - refDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'payday';
  if (diffDays === 1) return 'one_day_before';
  if (diffDays === 3) return 'three_days_before';
  return null;
}

// Triggered every morning at 08:00 AM UK time
exports.dailyPaydayCheck = onSchedule({
  schedule: '0 8 * * *',
  timeZone: 'Europe/London',
  memory: '256MiB'
}, async (event) => {
  const today = new Date();
  logger.info(`Running daily payday notification check for ${today.toISOString()}`);

  try {
    const usersSnapshot = await db.collection('users')
      .where('notificationsEnabled', '==', true)
      .get();

    logger.info(`Found ${usersSnapshot.size} active users to check.`);

    const sendPromises = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const { paydayConfig, region, fcmToken } = userData;

      if (!paydayConfig || !region || !fcmToken) {
        return;
      }

      const notificationType = getNotificationType(paydayConfig, region, today);

      if (notificationType) {
        let title = '';
        let body = '';

        if (notificationType === 'payday') {
          title = "It's Payday! 🎉";
          body = "Your salary is here! Time to celebrate.";
        } else if (notificationType === 'one_day_before') {
          title = "Payday Tomorrow! 💸";
          body = "Your payday is tomorrow. Get ready!";
        } else if (notificationType === 'three_days_before') {
          title = "Payday in 3 Days! 💰";
          body = "Only 3 days left until payday.";
        }

        logger.info(`Sending ${notificationType} notification to user document: ${doc.id}`);

        const message = {
          token: fcmToken,
          notification: {
            title: title,
            body: body
          },
          android: {
            notification: {
              sound: 'default'
            }
          },
          apns: {
            payload: {
              aps: {
                sound: 'default'
              }
            }
          }
        };

        sendPromises.push(
          messaging.send(message)
            .then(() => {
              logger.info(`Successfully sent message to token: ${doc.id}`);
            })
            .catch((error) => {
              logger.error(`Error sending message to token: ${doc.id}`, error);
              // Clean up token if it's expired or unregistered
              if (error.code === 'messaging/registration-token-not-registered') {
                logger.info(`Removing unregistered token from Firestore: ${doc.id}`);
                return db.collection('users').doc(doc.id).delete();
              }
            })
        );
      }
    });

    await Promise.all(sendPromises);
    logger.info('Finished daily payday check execution.');
  } catch (error) {
    logger.error('Error in dailyPaydayCheck:', error);
  }
});
