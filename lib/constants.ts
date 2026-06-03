export type EventItem = {
  title: string;
  slug: string;
  location: string;
  date: string;
  time: string;
  image: string;
};

export const events: EventItem[] = [
  {
    title: "NodeConf EU 2026",
    slug: "nodeconf-eu-2026",
    location: "Dublin, Ireland",
    date: "June 18-20, 2026",
    time: "09:00 - 18:00",
    image: "/images/event1.png",
  },
  {
    title: "React Summit 2026",
    slug: "react-summit-2026",
    location: "Amsterdam, Netherlands",
    date: "July 10-11, 2026",
    time: "10:00 - 17:30",
    image: "/images/event2.png",
  },
  {
    title: "HackZurich 2026",
    slug: "hackzurich-2026",
    location: "Zurich, Switzerland",
    date: "August 21-24, 2026",
    time: "24h Hackathon",
    image: "/images/event3.png",
  },
  {
    title: "Next.js Conf 2026",
    slug: "nextjs-conf-2026",
    location: "London, UK",
    date: "September 12, 2026",
    time: "09:30 - 17:00",
    image: "/images/event4.png",
  },
  {
    title: "Vue.js Amsterdam 2026",
    slug: "vuejs-amsterdam-2026",
    location: "Amsterdam, Netherlands",
    date: "October 3-4, 2026",
    time: "09:00 - 18:00",
    image: "/images/event5.png",
  },
  {
    title: "Tech Meetup: AI & Web3",
    slug: "tech-meetup-ai-web3",
    location: "Berlin, Germany",
    date: "June 28, 2026",
    time: "18:30 - 21:30",
    image: "/images/event6.png",
  },
  {
    title: "Full Stack Fest 2026",
    slug: "full-stack-fest-2026",
    location: "Barcelona, Spain",
    date: "November 15-16, 2026",
    time: "09:00 - 18:00",
    image: "/images/event1.png",
  }
];
