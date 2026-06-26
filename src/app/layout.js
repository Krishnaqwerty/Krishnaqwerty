
import "./globals.css";
import { AvatarApply } from "@/components/ui/avatar-apply";
import { profile } from "@/lib/profile";




export const metadata = {
  title: "Krishna Kumar | Java Full-Stack, Microservices & AI Systems Engineer",
  description: "Production-grade platform of Krishna Kumar. Specializing in high-throughput Java microservices, Spring Boot backend ecosystems, low-level systems compilation, and optimized Deep Learning applications.",
  keywords: [
    "Java",
    "Microservices",
    "Spring-Boot",
    "Krishna",
    "Engineer",
    "Developer",
    "Software",
    "Software Engineer",
    "Software Developer",
    "Full Stack Developer",
    "Deep Learning",
    "LLM Applications",
    "Computer Science"
  ],
  authors: [{ name: "Krishna Kumar" }],
  openGraph: {
    title: "Krishna Kumar | Java Full-Stack, Microservices & AI Systems Engineer",
    description: "Enterprise software systems architectural hub. Featuring performant Spring Boot pipelines, custom language compilers, and deep learning architectures.",
    type: "profile",
    firstName: "Krishna",
    lastName: "Kumar",
    username: "krishnaqwerty",
    url: "https://github.com/krishnaqwerty",
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://github.com/krishnaqwerty/#website",
        "url": "https://github.com/krishnaqwerty",
        "name": "Krishna Kumar | Core Software Engineering & Intelligent Systems",
        "description": "Domain-driven technical authority on Java, Spring Boot Microservices, and Deep Learning pipelines."
      },
      {
        "@type": "Person",
        "@id": "https://github.com/krishnaqwerty/#person",
        "name": "Krishna Kumar",
        "jobTitle": "Software Engineer",
        "knowsAbout": [
          "Java",
          "Microservices",
          "Spring Boot",
          "Hibernate/JPA",
          "RESTful API Design",
          "Computer Science",
          "Compiler Design",
          "Deep Learning",
          "Large Language Models (LLMs)",
          "React.js"
        ],
        "alumniOf": {
          "@type": "EducationalOrganization",
          "name": "Lovely Professional University"
        },
        "sameAs": [
          "https://www.linkedin.com/in/krishnaqwerty/",
          "https://github.com/krishnaqwerty",
          "https://krishnaqwerty.medium.com/"
        ],
        "hasCredential": [
          {
            "@type": "EducationalOccupationalCredential",
            "name": "B.Tech in Computer Science and Engineering"
          }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "Pebble",
        "description": "A minimal functional programming language and portable native compiler built from scratch in C, featuring deterministic memory execution and higher-order functions.",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "All",
        "url": "https://pebble.krishnakumar.tech/",
        "author": {
          "@id": "https://github.com/krishnaqwerty/#person"
        }
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <AvatarApply>
          {children}
        </AvatarApply>
      </body>
    </html>
  );
}
