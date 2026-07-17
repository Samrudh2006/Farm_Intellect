export type Language =
  | 'en' | 'hi' | 'bn' | 'te' | 'ta' | 'pa' | 'mr' | 'gu' | 'kn'
  | 'ml' | 'or' | 'as' | 'ur' | 'sa' | 'ne' | 'sd' | 'ks' | 'kok'
  | 'doi' | 'mai' | 'mni' | 'sat' | 'brx';

// RTL language support required for Urdu only
export const RTL_LANGUAGES: Language[] = ['ur'];

export const isRTL = (lang: Language): boolean => RTL_LANGUAGES.includes(lang);

// Font family mapping for each script
export const getScriptFontFamily = (lang: Language): string => {
  switch (lang) {
    case 'hi':
    case 'mr':
    case 'sa':
    case 'ne':
    case 'kok':
    case 'doi':
    case 'mai':
    case 'brx':
      return "'Noto Sans Devanagari', 'Poppins', sans-serif";
    case 'bn':
    case 'as':
      return "'Noto Sans Bengali', 'Poppins', sans-serif";
    case 'ta':
      return "'Noto Sans Tamil', 'Poppins', sans-serif";
    case 'te':
      return "'Noto Sans Telugu', 'Poppins', sans-serif";
    case 'kn':
      return "'Noto Sans Kannada', 'Poppins', sans-serif";
    case 'ml':
      return "'Noto Sans Malayalam', 'Poppins', sans-serif";
    case 'gu':
      return "'Noto Sans Gujarati', 'Poppins', sans-serif";
    case 'pa':
      return "'Noto Sans Gurmukhi', 'Poppins', sans-serif";
    case 'or':
      return "'Noto Sans Oriya', 'Poppins', sans-serif";
    case 'ur':
      return "'Noto Nastaliq Urdu', 'Noto Sans Arabic', sans-serif";
    case 'sd':
    case 'ks':
      return "'Noto Sans Arabic', 'Noto Nastaliq Urdu', sans-serif";
    case 'mni':
      return "'Noto Sans Meetei Mayek', 'Poppins', sans-serif";
    case 'sat':
      return "'Noto Sans Ol Chiki', 'Poppins', sans-serif";
    default:
      return "'Poppins', sans-serif";
  }
};

export const languageOptions: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ur', name: 'Urdu', nativeName: 'اُردُو' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो' },
];
