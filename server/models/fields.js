// Schema field builders with readable validation messages. The messages are
// shown verbatim next to the matching field in the admin panel.
import { isSafeUrl, LIMITS } from '../../shared/content.js';

export const text = (label, max, options = {}) => ({
  type: String,
  trim: true,
  default: '',
  maxlength: [max, `${label} must be ${max} characters or fewer.`],
  ...options,
});

export const requiredText = (label, max, options = {}) =>
  text(label, max, { required: [true, `${label} is required.`], ...options });

export const url = (label, { allowRelative = true, required = false } = {}) => ({
  type: String,
  trim: true,
  default: '',
  maxlength: [LIMITS.url, `${label} is too long.`],
  validate: {
    validator: (value) => !value || isSafeUrl(value, { allowRelative }),
    message: allowRelative
      ? `${label} must start with https:// (or be a site path starting with /).`
      : `${label} must be a full URL starting with https://.`,
  },
  ...(required ? { required: [true, `${label} is required.`] } : {}),
});

export const maxItems = (max, noun) => ({
  validator: (items) => !items || items.length <= max,
  message: `Add at most ${max} ${noun}.`,
});

export const stringList = (noun, itemMax, countMax) => ({
  type: [
    {
      type: String,
      trim: true,
      maxlength: [itemMax, `Each ${noun} must be ${itemMax} characters or fewer.`],
    },
  ],
  default: [],
  validate: maxItems(countMax, `${noun}s`),
});
