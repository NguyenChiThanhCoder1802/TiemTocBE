import NodeCache from "node-cache";
const  otpCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
export default otpCache;