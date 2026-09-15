const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const user = await db.collection('users').findOne({ name: /garima/i });
  console.log('User found:', user?._id, user?.name, user?.role);

  const w = await db.collection('workers').findOne({ userId: user?._id });
  console.log('Worker found:', w?._id, w?.availability);

  const booking = await db.collection('bookings').findOne({ _id: new mongoose.Types.ObjectId('6aa8c9f49c38415f3eeb3633') });
  console.log('Booking workerId:', booking?.workerId, 'Matches w._id?', booking?.workerId?.equals(w?._id));

  const statusIn = ['WORKER_ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'SERVICE_STARTED'];
  const jobs = await db.collection('bookings').find({
    workerId: w?._id,
    status: { $in: statusIn }
  }).toArray();
  console.log('Matching jobs count:', jobs.length);

  // Check all users named garima or similar
  const allGarimas = await db.collection('users').find({ name: /garima/i }).toArray();
  console.log('All garima users:', allGarimas.map(u => ({ id: u._id, phone: u.phone, role: u.role })));

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

