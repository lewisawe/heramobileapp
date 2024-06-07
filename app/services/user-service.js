import axios from 'axios';
import {baseURL} from '../store/constants';
import {loadString} from '../../utils/storage';

export const heraClient = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

async function getOtp(phoneNumber, acceptLanguage, token) {
  return await heraClient.post(
    '/otp_auth/request_challenge/',
    {phone_number: phoneNumber, token: token},
    {
      headers: {'Accept-Language': acceptLanguage},
    },
  );
}

async function verifyOtp(phoneNumber, secretCode) {
  return await heraClient.post('/otp_auth/attempt_challenge/', {
    phone_number: phoneNumber,
    secret: secretCode,
  });
}

async function getOnboardingProgress(userId) {
  const token = await loadString('token');
  return await heraClient.get('/onboarding_progresses/' + userId + '/', {
    headers: {Authorization: 'Token ' + token},
  });
}

async function updateUserLanguage(userId, languageKey) {
  const token = await loadString('token');
  return await heraClient.patch(
    '/user_profiles/' + userId + '/',
    {language_code: languageKey},
    {
      headers: {Authorization: 'Token ' + token},
    },
  );
}

async function getSectionsOfConcept(conceptId, language_code) {
  return await heraClient.get(
    `/concepts/${conceptId}/${language_code}/sections/`,
  );
}

async function getArticle(articleId, language_code) {
  return await heraClient.get(`/articles/${articleId}/${language_code}/`);
}

async function getWhatsAppOptStatus(phone_number) {
  const token = await loadString('token');
  const response = await heraClient.get(
    '/whatsapp_opt_in_out/?username=' + phone_number,
    {
      headers: {Authorization: 'Token ' + token},
    },
  );

  return response.data.opt_status;
}

async function updateWhatsAppOptStatus(phone_number, opt_status) {
  const token = await loadString('token');
  return await heraClient.post(
    '/whatsapp_opt_in_out/',
    {
      username: phone_number,
      opt_status: opt_status,
      source: 'hera_app',
    },
    {
      headers: {Authorization: 'Token ' + token},
    },
  );
}

async function getFullPhoneNumber() {
  const data = await getPhoneNumber();
  if (data.phone_country_code === null || data.phone_national_number === null) {
    return '';
  } else {
    return `+${data.phone_country_code}${data.phone_national_number}`;
  }
}

async function getPhoneNumber() {
  const token = await loadString('token');
  const response = await heraClient.get('/users/me/', {
    headers: {Authorization: 'Token ' + token},
  });

  return response.data;
}

export const userService = {
  getOtp,
  verifyOtp,
  getOnboardingProgress,
  updateUserLanguage,
  getSectionsOfConcept,
  getArticle,
  getWhatsAppOptStatus,
  getFullPhoneNumber,
  getPhoneNumber,
  updateWhatsAppOptStatus,
};
