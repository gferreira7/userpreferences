import { IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PreferencesDto {
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') {
        return true;
      } else if (value.toLowerCase() === 'false') {
        return false;
      }
    }
    return value;
  })
  termsAndConditionsAccepted: boolean;

  @IsString()
  languagePreference: string;

  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') {
        return true;
      } else if (value.toLowerCase() === 'false') {
        return false;
      }
    }
    return value;
  })
  showProfilePreferences: boolean;

  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') {
        return true;
      } else if (value.toLowerCase() === 'false') {
        return false;
      }
    }
    return value;
  })
  showLanguagesPreferences: boolean;
}
