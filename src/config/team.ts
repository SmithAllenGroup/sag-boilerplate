export interface TeamMember {
  name: string;
  role: string;
  imageUrl: string;
  link?: string;
}

export const team: TeamMember[] = [
  {
    name: "Jane Doe",
    role: "Managing Broker",
    imageUrl: "/images/profiles/jane-doe.jpg",
    link: "/about/jane-doe/",
  },
  {
    name: "John Smith",
    role: "Agent",
    imageUrl: "/images/profiles/john-smith.jpg",
  },
];
