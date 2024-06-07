import {createActions} from 'reduxsauce';

const {Types, Creators} = createActions({
  verifyOtp: ['countryCode', 'phoneNumber', 'secretCode'],
  resendOtp: ['phoneNumber', 'acceptLanguage'],
  verifyOtpLoading: null,
  verifyOtpSuccess: ['data'],
  verifyOtpFailure: ['errorMessage'],
  resendOtpSuccess: null,
  resendOtpFailure: ['errorMessage'],
  resetState: ['reducerName'],
});

export const VerifyOtpTypes = Types;
export default Creators;
