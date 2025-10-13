import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
    collections: {
        wiki: defineCollection({
            type: 'page',
            // Will read from /content/wiki/** (md, yml, json are fine)
            source: 'wiki/**/*.{md,yml,json}',
            schema: z.object({
                title: z.string().optional(),
                description: z.string().optional(),   // prefer "description" in v3
                order: z.number().optional(),
                tags: z.array(z.string()).optional(),
                status: z.enum(['draft', 'stable', 'deprecated']).optional(),
                version: z.string().optional(),
                updatedAt: z.string().optional(),
                module: z.string().optional()
            }).passthrough()
        })
    }
})
