import React from "react";
import { SiGithub, SiLinkedin } from "react-icons/si";
const profileData = {
  name: "Mohamed Boussas",
  subtitle: "Software Engineer",
  imageUrl:
    "https://media.licdn.com/dms/image/v2/D4E03AQFs2gP27vwVlw/profile-displayphoto-shrink_200_200/B4EZY9TJOaHgAY-/0/1744785151912?e=1763596800&v=beta&t=rUqYi25aB-n32Cwwp8SbdutzCcQf2o6cHxxKSF1NGUY",
  githubUrl: "https://github.com/boussas",
  linkedinUrl: "https://www.linkedin.com/in/mohamed-boussas/",
};

interface SocialLinkProps {
  href: string;
  title: string;
  icon: React.ReactNode;
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, title, icon }) => (
  <a
    href={href}
    title={title}
    target="_blank"
    rel="noopener noreferrer me"
    className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300"
    aria-label={title}
  >
    {icon}
  </a>
);

const HomeProfile: React.FC = () => {
  return (
    <div className="flex flex-col items-center bg-transparent px-2 sm:p-2 rounded-xl max-w-sm mx-auto h-fit">
      <div>
        <img
          className="w-25 h-25 rounded-full object-cover border-4 border-black"
          src={profileData.imageUrl}
          alt={`Profile picture of ${profileData.name}`}
          title={profileData.name}
        />
      </div>

      <h1 className="mt-3 text-2xl font-extrabold text-center text-gray-900  ">
        {profileData.name}
      </h1>

      <div className="mb-1 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-lg text-center text-gray-600">
        <span>{profileData.subtitle}</span>

        <span className="hidden sm:block text-gray-400">|</span>

        <div className="flex items-center gap-4 mb-2">
          <SocialLink
            href={profileData.githubUrl}
            title="GitHub"
            icon={
              <SiGithub className="w-5 h-5 text-black hover:text-purple-500" />
            }
          />
          <SocialLink
            href={profileData.linkedinUrl}
            title="LinkedIn"
            icon={
              <SiLinkedin className="w-5 h-5 text-black hover:text-blue-500" />
            }
          />
        </div>
      </div>
    </div>
  );
};

export default HomeProfile;
