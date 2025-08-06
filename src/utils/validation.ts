/**
 * Validation schemas using Zod for comprehensive input validation
 */
import { z } from 'zod';

// Base validations
export const emailSchema = z.string()
  .email('Ogiltig e-postadress')
  .min(1, 'E-post krävs')
  .max(255, 'E-postadressen är för lång');

export const passwordSchema = z.string()
  .min(8, 'Lösenordet måste vara minst 8 tecken långt')
  .max(128, 'Lösenordet är för långt')
  .regex(/[A-Z]/, 'Lösenordet måste innehålla minst en stor bokstav')
  .regex(/[a-z]/, 'Lösenordet måste innehålla minst en liten bokstav')
  .regex(/\d/, 'Lösenordet måste innehålla minst en siffra')
  .refine(val => !/(.)\1{2,}/.test(val), 'Lösenordet får inte innehålla mer än 2 identiska tecken i rad');

export const urlSchema = z.string()
  .url('Ogiltig URL')
  .max(2048, 'URL:en är för lång')
  .optional()
  .or(z.literal(''));

export const textSchema = z.string()
  .max(1000, 'Texten är för lång')
  .transform(val => val.trim());

export const longTextSchema = z.string()
  .max(5000, 'Texten är för lång (max 5000 tecken)')
  .transform(val => val.trim());

export const phoneSchema = z.string()
  .regex(/^[+]?[\d\s\-\(\)]{7,15}$/, 'Ogiltigt telefonnummer')
  .optional()
  .or(z.literal(''));

export const priceSchema = z.number()
  .min(0, 'Priset måste vara minst 0')
  .max(99999, 'Priset är för högt')
  .finite('Priset måste vara ett giltigt nummer');

// Site content validation
export const siteContentSchema = z.object({
  title: textSchema.optional(),
  subtitle: textSchema.optional(),
  description: longTextSchema.optional(),
  button_text: textSchema.optional(),
  button_link: urlSchema.optional(),
});

// Menu item validation
export const menuItemSchema = z.object({
  name: z.string().min(1, 'Namn krävs').max(100, 'Namnet är för långt'),
  description: textSchema.optional(),
  price: priceSchema,
  category_id: z.string().uuid('Ogiltigt kategori-ID').optional(),
  available: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

// Menu category validation
export const menuCategorySchema = z.object({
  name: z.string().min(1, 'Namn krävs').max(50, 'Namnet är för långt'),
  sort_order: z.number().int().min(0).default(0),
});

// Event validation
export const eventSchema = z.object({
  title: z.string().min(1, 'Titel krävs').max(200, 'Titeln är för lång'),
  description: longTextSchema.optional(),
  event_date: z.date('Ogiltigt datum'),
  registration_deadline: z.date('Ogiltigt datum').optional(),
  max_participants: z.number().int().min(1).max(1000).optional(),
  price: priceSchema.optional(),
  registration_email: emailSchema.optional(),
  registration_phone: phoneSchema.optional(),
  registration_url: urlSchema.optional(),
  event_type: z.enum(['tournament', 'league', 'party', 'course', 'other']).default('tournament'),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
  featured: z.boolean().default(false),
});

// Livestream validation
export const livestreamSchema = z.object({
  title: z.string().min(1, 'Titel krävs').max(200, 'Titeln är för lång'),
  description: longTextSchema.optional(),
  youtube_video_id: z.string().regex(/^[a-zA-Z0-9_-]{11}$/, 'Ogiltigt YouTube video-ID').optional(),
  youtube_channel_id: z.string().regex(/^[a-zA-Z0-9_-]{24}$/, 'Ogiltigt YouTube kanal-ID').optional(),
  scheduled_start: z.date('Ogiltigt datum').optional(),
  scheduled_end: z.date('Ogiltigt datum').optional(),
  status: z.enum(['scheduled', 'live', 'ended', 'cancelled']).default('scheduled'),
  is_main_stream: z.boolean().default(false),
  featured: z.boolean().default(false),
});

// Gallery image validation
export const galleryImageSchema = z.object({
  title: z.string().min(1, 'Titel krävs').max(100, 'Titeln är för lång'),
  description: textSchema.optional(),
  file_path: z.string().min(1, 'Filsökväg krävs'),
  file_size: z.number().int().min(1).max(10485760), // Max 10MB
  mime_type: z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']),
  sort_order: z.number().int().min(0).default(0),
  is_featured: z.boolean().default(false),
  show_in_slideshow: z.boolean().default(false),
});

// Opening hours validation
export const openingHoursSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  open_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltigt tidsformat (HH:MM)').optional(),
  close_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Ogiltigt tidsformat (HH:MM)').optional(),
  is_closed: z.boolean().default(false),
});

// Auth validation
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Lösenord krävs'),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().max(100, 'Visningsnamnet är för långt').optional(),
});

// Utility function to validate and sanitize data
export const validateAndSanitize = <T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors?: string[] 
} => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.issues.map(issue => issue.message) 
      };
    }
    return { 
      success: false, 
      errors: ['Okänt valideringsfel'] 
    };
  }
};