import React from 'react';
// import { QrCode, Star, Hand } from 'lucide-react';
import Navbar from '../components/ui/navbar';
import Footer from '../components/ui/footer';
import Face from "../components/icons/face.svg";
import Hand from "../components/icons/hand.svg";
import Star from "../components/icons/star.svg";
import User from "../components/icons/jaEpYJA.webp";
import { FaOpenid } from 'react-icons/fa';
import { GiTalk } from 'react-icons/gi';
import { FaRegSmileBeam } from 'react-icons/fa';
import { FaSmile } from 'react-icons/fa';
import { FaSmileWink } from 'react-icons/fa';
import { FaRegSmile } from 'react-icons/fa';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion.tsx";
const Login = () => {
  return (
    <div className="min-h-screen min-w-screen bg-white text-black">
      {/* <Navbar /> */}
      {/* Hero Section */}
      <main className="relative">
        <section className="w-screen mx-auto px-4 py-16 bg-image " >
          <h1 className="text-3xl md:text-5xl font-bold text-center mb-10">
            Join the Ultimate Base Chat Experience
          </h1>
          <div className="text-2xl md:text-3xl font-semibold text-start md:ml-[26vw] mb-10">
            Use your Base Name to Chat on deBase
          </div>
          <div className="">

            {/* Dotted background pattern */}
            <div className="absolute top-[15vh] md:left-[30vw] w-full h-full">
              <video autoPlay="true" className='md:w-[50vw] h-[80vh] w-[80vw]' muted loop playsInline >
                <source src="/123.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
            {/* <div
              id="SR7_1293_1-1871-2"
              className="tp-shape tp-shapewrapper tp-thecluster sr7-layer"
              style={{
                overflow: 'visible',
                padding: '0px',
                width: '825px',
                height: '825px',
                zIndex: 13,
                position: 'absolute',
                transformOrigin: '50% 50%',
                transform: 'translate(0px, 0px)',
                display: 'block',
                left: '399.5px',
                top: '34px',
                background: 'rgba(0, 0, 0, 0)',
                visibility: 'visible',
                opacity: 1,
                pointerEvents: 'auto',
              }}
            >
              <canvas
                width="825"
                height="825"
                style={{
                  background: 'transparent',
                  width: '825px',
                  height: '825px',
                  position: 'absolute',
                  top: '0px',
                  left: '0px',
                  zIndex: 2,
                }}
              />
            </div> */}
            <div className="grid gap-16  items-center max-w-5xl mx-auto grid-cols-1"> {/* Changed grid-cols-3 to grid-cols-1 */}
              {/* Feature Cards */}
              <div className="flex flex-row rounded-xl shadow-lg p-2 transform md:translate-x-[450px] md:w-[450px] md:h-[130px] bg-gray-100 pr-2 md:pr-12">
                <div className="bg-[#0052FF] w-[160px] h-[84px] px-2 rounded-2xl flex items-center justify-center mt-4 mr-2 md:mt-4 md:mr-8">
                  {/* <img src={FaUser} alt="Star" className="w-[84px] h-[84px] text-white" /> */}
                  <FaOpenid className="w-[84px] h-[84px] text-white" />
                </div>
                <div className='flex flex-col'>
                  <h3 className="text-xl font-semibold mb-2 text-black z-50">Build Your Digital Identity</h3>
                  <p className="text-gray-600 text-sm">
                    Use your ENS or Base name to log in and join the community. Show off your unique identity as part of the deBase chat experience.
                  </p>
                </div>
              </div>
              <div className="flex flex-row rounded-xl shadow-lg p-2 transform md:translate-x-[150px] md:w-[450px] md:h-[130px] bg-gray-100 pr-2 md:pr-12">
                <div className="bg-green-500 min-w-[96px] h-[84px] px-2 rounded-2xl flex items-center justify-center mt-8 mr-2 md:mt-4 md:mr-8">
                  <img src="/conversation.png" alt="Star" className="w-[100px] h-[72px] text-white" />
                  {/* <GiTalk className="w-[100px] h-[84px] text-white" /> */}
                </div>
                <div className='flex flex-col'>
                  <h3 className="text-xl font-semibold mb-2 text-black">Connect & Chat in Real-Time</h3>
                  <p className="text-gray-600 text-sm">
                    Dive into a continuous chat stream with other crypto enthusiasts, sharing insights, jokes, and conversations that never end.
                  </p>
                </div>
              </div>
              <div className="flex flex-row rounded-xl shadow-lg p-2 transform md:translate-x-[450px] md:w-[450px] md:h-[130px] bg-gray-100 pr-2 md:pr-12">
                <div className="bg-[#8A55E9] min-w-[84px] h-[84px] px-2 rounded-2xl flex items-center justify-center mt-5 mr-2 md:mt-4 md:mr-8">
                  {/* <img src={Hand} alt="Star" className="w-[84px] h-[84px] text-white" /> */}
                  {/* <FaSmile className="w-[84px] h-[84px] text-white" />
                  <FaRegSmileBeam className="w-[84px] h-[84px] text-white" /> */}
                  <FaSmileWink className="w-[84px] h-[84px] text-white" />
                  {/* <FaRegSmileBeam className="w-[84px] h-[84px] text-white" /> */}
                </div>
                <div className='flex flex-col'>
                  <h3 className="text-xl font-semibold mb-2 text-black">Simple and Fun</h3>
                  <p className="text-gray-600 text-sm">
                    With a straightforward, no-threads format, deBase keeps things light and lively. No complex setup or endless threads—just one chatbox where everyone can jump in!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="mt-6">
          <div className="flex text-center md:flex-row gap-4 items-center justify-center px-4 md:px-[400px]">
            {/* <div className='order-2 md:order-1'>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
              <img
                src={User}
                alt="Decentralized Network"
                className="relative rounded-2xl shadow-2xl "
              />
            </div> */}
            <div className='order-1 md:order-2 md:px-12'>
              <h2 className="text-4xl font-bold mb-6">What is deBase?</h2>
              <p className="text-gray-600 text-xl leading-relaxed text-start">
                deBase is a new kind of social space where crypto users connect with their Ethereum identity.
                <br />
                Whether you’re here to share ideas, join the banter, or just see what others are saying, deBase keeps it real and engaging.
              </p>
            </div>
          </div>
        </div>
      </main>
      <section className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-start md:flex-row">
          <div className="mb-12 mr-4">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Questions?
              <br />
              See our FAQ
            </h2>
            <p className="text-lg text-black">
              Get more answers in our FAQ, and view our developer docs to see how you can build with Basenames.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem value="item-1" className="border-b w-full">
              <AccordionTrigger className="text-lg font-medium text-left">
                What is deBase?
              </AccordionTrigger>
              <AccordionContent className="text-md">
                deBase is a unique chat platform that uses Base and Ethereum identities to create an open, fun, and lively chat experience for crypto enthusiasts.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-b w-full">
              <AccordionTrigger className="text-lg font-medium text-left">
                What are the registration fees?
              </AccordionTrigger>
              <AccordionContent className="text-md">
                Just a small monthly subscription fee (e.g., $2) to access the deBase chat room and become part of the conversation.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-b w-full ">
              <AccordionTrigger className="text-lg font-medium text-left">
                How do I get started?
              </AccordionTrigger>
              <AccordionContent className="text-md">
                Log in with your Base wallet, pay the small monthly fee, and jump right into the chat room!
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-b">
              <AccordionTrigger className="text-lg font-medium text-left">
                How can I use Basenames?
              </AccordionTrigger>
              <AccordionContent className="text-md">
                You can use your Basename across apps in the Base ecosystem, starting with base.org, Onchain Registry, and Onchain Summer Pass. You can also use it for sending and receiving on Base and other EVM chains.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-b">
              <AccordionTrigger className="text-lg font-medium text-left">
                Can I use my existing Ethereum name?
              </AccordionTrigger>
              <AccordionContent className="text-md">
                Yes! Your Base and Ethereum name is your ticket to the deBase community. Just connect your wallet and start chatting.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border-b">
              <AccordionTrigger className="text-lg font-medium text-left">
                How do I update my profile or identity?
              </AccordionTrigger>
              <AccordionContent className="text-md">
                You can update your Ethereum name or wallet profile anytime and bring your unique identity to the deBase chat.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border-b">
              <AccordionTrigger className="text-lg font-medium text-left">
                How do I contact support?
              </AccordionTrigger>
              <AccordionContent className="text-md">
                Chat with us directly on deBase.  We won't ask for your private keys or seed phrases.  Keep those private.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
      <Footer />
    </div>

  );
};

export default Login;