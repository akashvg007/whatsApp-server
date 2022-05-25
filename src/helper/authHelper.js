const bcrypt = require("bcrypt");

const encryptPassword = async (password) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    console.log("encryptPassword::salt2", salt);
    const hash = bcrypt.hashSync(password, salt);
    console.log("encryptPassword::hash", hash);
    return hash;
  } catch (err) {
    console.log("encryptPassword::catch", err.message);
    throw err;
    // return password;
  }
};

const compareHash = async (password, hash) => {
  const result = await bcrypt.compare(password, hash);
  return result;
};

module.exports = {
  encryptPassword,
  compareHash,
};
