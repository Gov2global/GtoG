// lib/autoScheduler.js
import cron from 'node-cron';
import { processDueBroadcasts } from './broadcastScheduler';

cron.schedule('* * * * *', async () => {
  console.log('[Cron] Running broadcast scheduler...');
  try {
    const count = await processDueBroadcasts();
    console.log(`[Cron] ✅ Processed ${count} broadcasts`);
  } catch (e) {
    console.error('[Cron Error]', e);
  }
});
