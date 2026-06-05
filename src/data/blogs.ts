import blogImage from "../assets/blogImage.png";

export type Blog = {
  id: number;
  title: string;
  author: string;
  date: string;
  read: string;
  image: string;
  body: string;
  link: string;
};

export const blogs: Blog[] = [
  {
    id: 1,
    title: "A Very Long Title",
    author: "XYZ",
    date: "00-00-0000",
    read: "0 min read",
    image: blogImage,
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
    link: "#",
  },
  {
    id: 2,
    title: "A Very Long Title",
    author: "XYZ",
    date: "00-00-0000",
    read: "0 min read",
    image: blogImage,
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
    link: "#",
  },
  {
    id: 3,
    title: "A Very Long Title",
    author: "XYZ",
    date: "00-00-0000",
    read: "0 min read",
    image: blogImage,
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. The art of doing more with less is ancient, yet its application in modern design remains as powerful as ever.",
    link: "#",
  },
  {
    id: 4,
    title: "A Very Long Title",
    author: "XYZ",
    date: "00-00-0000",
    read: "0 min read",
    image: blogImage,
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
    link: "#",
  },
  {
    id: 5,
    title: "A Very Long Title",
    author: "XYZ",
    date: "00-00-0000",
    read: "0 min read",
    image: blogImage,
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
    link: "#",
  },
];
