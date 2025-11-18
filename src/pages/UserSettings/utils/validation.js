// UserSettings Validation Functions
import { getErrorMessage } from './translations';

export const validateProfileField = (field, value) => {
  switch (field) {
    case "email":
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return getErrorMessage('invalidEmail');
      }
      break;
    case "firstName":
      if (!value.trim()) return getErrorMessage('firstNameRequired');
      if (value.trim().length < 2) return getErrorMessage('firstNameTooShort');
      if (value.trim().length > 50) return getErrorMessage('firstNameTooLong');
      break;
    case "lastName":
      if (!value.trim()) return getErrorMessage('lastNameRequired');
      if (value.trim().length < 2) return getErrorMessage('lastNameTooShort');
      if (value.trim().length > 50) return getErrorMessage('lastNameTooLong');
      break;
    case "phone":
       if (value) {
         // Remove all non-digit characters except +
         const cleanNumber = value.replace(/[^\d+]/g, "");
         // Check if it starts with + followed by digits, or just digits
         // Minimum 10 digits (including country code), maximum 15 digits
         // Must start with + or digit, and contain at least 10 digits total
         const phoneRegex = /^(\+\d{1,3})?\d{7,14}$/;
         if (!phoneRegex.test(cleanNumber) || cleanNumber.replace(/\D/g, '').length < 10) {
           return getErrorMessage('invalidPhone');
         }
       }
       break;
    case "photoURL":
      if (value && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(value)) {
        return getErrorMessage('invalidImageUrl');
      }
      break;
    case "birthDate":
      if (value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          return getErrorMessage('invalidDate');
        }
        if (date > new Date()) {
          return getErrorMessage('invalidDate'); // Could add specific message for future dates
        }
      }
      break;
    case "gender":
      if (
        value &&
        !["male", "female"].includes(value)
      ) {
        return getErrorMessage('invalidGender');
      }
      break;
    case "profession":
      if (value && value.trim().length > 80) {
        return getErrorMessage('professionTooLong');
      }
      break;
    default:
      return "";
  }
  return "";
};

export const validateSecurityField = (field, value, formData) => {
  switch (field) {
    case "currentPassword":
      if (!value) return getErrorMessage('currentPasswordRequired');
      break;
    case "newPassword":
      if (!value) return getErrorMessage('newPasswordRequired');
      if (value.length < 8) return getErrorMessage('passwordTooShort');
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return getErrorMessage('passwordWeak');
      }
      break;
    case "confirmPassword":
      if (!value) return getErrorMessage('newPasswordRequired'); // Reusing message for confirmation
      if (value !== formData.newPassword) return getErrorMessage('passwordsNotMatch');
      break;
    default:
      return "";
  }
  return "";
};

export const calculatePasswordStrength = (password) => {
  let score = 0;
  const feedback = [];

  if (password.length >= 8) score += 1;
  else feedback.push("Use at least 8 characters");

  if (password.length >= 12) score += 1;

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Add lowercase letters");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Add uppercase letters");

  if (/\d/.test(password)) score += 1;
  else feedback.push("Add numbers");

  if (/[^a-zA-Z\d]/.test(password)) score += 1;
  else feedback.push("Add special characters");

  return { score: Math.min(score, 5), feedback };
};