// export { codes } from "../Error/errorCode";
const defaultResp = {
  error: false,
  message: "",
  data: [],
  total: 0,
};

module.exports = (err, code, res, status = 200, data, count) => {
  defaultResp.data = [];
  defaultResp.message = "";
  defaultResp.error = false;
  defaultResp.total = 0;
  if (err) defaultResp.error = code;
  else {
    defaultResp.data = data || {};
    defaultResp.message = code;
    defaultResp.total = count;
  }
  res.status(status).json(defaultResp);
};

// module.exports = sendResponse;
