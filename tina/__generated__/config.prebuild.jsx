// tina/config.ts
import { defineConfig } from "tinacms";
var config_default = defineConfig({
  branch: process.env.GITHUB_BRANCH ?? "main",
  clientId: process.env.TINA_PUBLIC_CLIENT_ID ?? "",
  token: process.env.TINA_TOKEN ?? "",
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public"
    }
  },
  schema: {
    collections: [
      {
        name: "post",
        label: "Blog Posts",
        path: "src/content/posts",
        format: "md",
        fields: [
          {
            name: "header",
            label: "Header Quote",
            type: "string",
            required: true
          },
          {
            name: "date",
            label: "Date",
            type: "datetime",
            required: true,
            ui: { dateFormat: "YYYY-MM-DD" }
          },
          {
            name: "tagline",
            label: "Tagline",
            type: "string",
            required: true
          },
          {
            name: "subtitle",
            label: "Subtitle",
            type: "string",
            required: true
          },
          {
            name: "image",
            label: "Image",
            type: "image"
          },
          {
            name: "song",
            label: "Song of the Day",
            type: "string"
          },
          {
            name: "affirmations",
            label: "Affirmations",
            type: "string",
            list: true
          },
          {
            name: "body",
            label: "Body",
            type: "rich-text",
            isBody: true
          }
        ]
      },
      {
        name: "page",
        label: "Pages",
        path: "src/content/pages",
        format: "md",
        fields: [
          {
            name: "heading",
            label: "Heading",
            type: "string",
            required: true
          },
          {
            name: "body",
            label: "Body",
            type: "rich-text",
            isBody: true
          }
        ]
      },
      {
        name: "site",
        label: "Site Config",
        path: "src/content/site",
        format: "md",
        ui: { global: true },
        fields: [
          { name: "title", label: "Site Title", type: "string" },
          { name: "subtitle", label: "Site Subtitle", type: "string" },
          { name: "banner", label: "Banner Image", type: "image" },
          {
            name: "marquee",
            label: "Marquee Phrases",
            type: "string",
            list: true
          },
          {
            name: "socialLinks",
            label: "Social Links",
            type: "object",
            list: true,
            fields: [
              { name: "label", label: "Label", type: "string" },
              { name: "url", label: "URL", type: "string" }
            ]
          }
        ]
      },
      {
        name: "sidebar",
        label: "Sidebar",
        path: "src/content/sidebar",
        format: "md",
        ui: { global: true },
        fields: [
          { name: "avatar", label: "Avatar Image", type: "image" },
          {
            name: "bio",
            label: "Bio Lines",
            type: "string",
            list: true
          },
          {
            name: "likes",
            label: "Likes Table",
            type: "object",
            list: true,
            fields: [
              { name: "label", label: "Label", type: "string" },
              { name: "value", label: "Value", type: "string" }
            ]
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
