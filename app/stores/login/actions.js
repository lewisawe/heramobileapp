import {createActions} from 'reduxsauce';

const {Types, Creators} = createActions({
  getOtp: ['phoneNumber', 'acceptLanguage', 'token'],
  getOtpLoading: null,
  getOtpSuccess: null,
  getOtpFailure: ['errorMessage'],
  resetState: ['reducerName'],
});

export const GetOtpTypes = Types;
export default Creators;
