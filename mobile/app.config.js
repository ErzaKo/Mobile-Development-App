import 'dotenv/config';

export default {
  expo: {
    name: 'mobile-app',
    slug: 'mobile-app',
    version: '1.0.0',
    scheme: 'mobileapp', // ✅ <-- ADD THIS LINE
    extra: {
      BASE_URL: process.env.BASE_URL,
    },
  },
};
