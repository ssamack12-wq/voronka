const fileStore = require('./store-file');
const pgStore = require('./store-pg');

const usePostgres = Boolean(process.env.DATABASE_URL);

function wrap(name) {
  return async (...args) => {
    if (usePostgres) return pgStore[name](...args);
    return fileStore[name](...args);
  };
}

module.exports = {
  usePostgres,
  upsertUser: wrap('upsertUser'),
  getUserById: wrap('getUserById'),
  setUserPremiumStatus: wrap('setUserPremiumStatus'),
  saveUserPendingPayment: wrap('saveUserPendingPayment'),
  getUserPendingPayment: wrap('getUserPendingPayment'),
  clearUserPendingPayment: wrap('clearUserPendingPayment'),
  searchUsers: wrap('searchUsers'),
  deleteUserById: wrap('deleteUserById'),
  saveMagicToken: wrap('saveMagicToken'),
  consumeMagicToken: wrap('consumeMagicToken'),
  saveOtpCode: wrap('saveOtpCode'),
  consumeOtpCode: wrap('consumeOtpCode'),
  listDeals: wrap('listDeals'),
  saveDealProgress: wrap('saveDealProgress'),
  getDealProgress: wrap('getDealProgress'),
  deleteDealProgress: wrap('deleteDealProgress'),
  addConsultation: wrap('addConsultation')
};
