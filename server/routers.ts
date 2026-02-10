import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getUserGlossaries, createGlossary, getGlossaryById, getEntriesByGlossary, searchEntries, createEntry, getEntryById, updateEntry, deleteEntry } from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  glossaries: router({
    list: protectedProcedure.query(({ ctx }) => getUserGlossaries(ctx.user.id)),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await createGlossary({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
        });
        return result;
      }),
    
    getById: protectedProcedure
      .input(z.object({ glossaryId: z.number() }))
      .query(async ({ input }) => getGlossaryById(input.glossaryId)),
  }),

  entries: router({
    list: protectedProcedure
      .input(z.object({ glossaryId: z.number() }))
      .query(async ({ input }) => getEntriesByGlossary(input.glossaryId)),
    
    search: protectedProcedure
      .input(z.object({
        glossaryId: z.number(),
        searchTerm: z.string(),
      }))
      .query(async ({ input }) => searchEntries(input.glossaryId, input.searchTerm)),
    
    create: protectedProcedure
      .input(z.object({
        glossaryId: z.number(),
        term: z.string().min(1).max(255),
        definition: z.string().min(1),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await createEntry({
          glossaryId: input.glossaryId,
          term: input.term,
          definition: input.definition,
          imageUrl: input.imageUrl,
        });
        return result;
      }),
    
    getById: protectedProcedure
      .input(z.object({ entryId: z.number() }))
      .query(async ({ input }) => getEntryById(input.entryId)),
    
    update: protectedProcedure
      .input(z.object({
        entryId: z.number(),
        term: z.string().min(1).max(255).optional(),
        definition: z.string().min(1).optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { entryId, ...updates } = input;
        return updateEntry(entryId, updates);
      }),
    
    delete: protectedProcedure
      .input(z.object({ entryId: z.number() }))
      .mutation(async ({ input }) => deleteEntry(input.entryId)),
    
    uploadImage: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const buffer = Buffer.from(input.fileData, 'base64');
          const fileKey = `glossaire/${ctx.user.id}/${Date.now()}-${input.fileName}`;
          const { url } = await storagePut(fileKey, buffer, 'image/jpeg');
          return { success: true, url };
        } catch (error) {
          console.error('Image upload failed:', error);
          throw new Error('Failed to upload image');
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
