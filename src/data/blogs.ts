import blogImage from "../assets/blogImage.png";
import generated from "./blogs.generated.json";

export type Blog = {
  id: string;
  title: string;
  author: string;
  date: string;
  read: string;
  image: string;
  body: string;
  link: string;
};

// Written at build time by scripts/fetch-blogs.mjs from the Hashnode feed, so
// the posts are baked into the bundle rather than fetched by the browser.
const published = generated as Blog[];

// Only reached if a build ran with no cached posts and the feed was unreachable.
const placeholders: Blog[] = Array.from({ length: 5 }, (_, i) => ({
  id: `placeholder-${i + 1}`,
  title: "A Very Long Title",
  author: "XYZ",
  date: "00-00-0000",
  read: "0 min read",
  image: blogImage,
  body:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
  link: "#",
}));

export const blogs: Blog[] = published.length
  ? published.map((post) => ({ ...post, image: post.image || blogImage }))
  : placeholders;
