"use client";
import Footer from "@/components/Footer";
import { storage } from "@/firebase";
import {
  Button,
  Dialog,
  Input,
  Option,
  Select,
  Tooltip,
} from "@material-tailwind/react";
import axios from "axios";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaInfoCircle } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { toast } from "sonner";

const CreateServiceProvider = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const [inputData, setInputData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    image: {
      url: "",
      name: "",
    },
    gender: "",
    aadhar: "",
    city: "",
    password: "",
    role: "service-provider",
    active: false,
    image: null,
  });
  const [errors, setErrors] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    gender: "",
    aadhar: "",
    city: "",
    password: "",
    image: "",
  });
  const validateInputs = () => {
    let isValid = true; // Track the validity of inputs

    // Validate name
    if (!inputData.name) {
      toast.error("Name is required");
      isValid = false;
    }

    // Validate image
    if (!inputData.image) {
      toast.error("Image is required");
      isValid = false;
    }

    // Validate phone number
    if (!inputData.phoneNumber) {
      toast.error("Phone number is required");
      isValid = false;
    } else if (inputData.phoneNumber.length !== 10) {
      toast.error("Invalid Phone number");
      isValid = false;
    }

    // Validate email
    if (!inputData.email) {
      toast.error("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(inputData.email)) {
      toast.error("Invalid email address");
      isValid = false;
    }

    // Validate gender
    if (!inputData.gender) {
      toast.error("Gender is required");
      isValid = false;
    }

    // Validate aadhar
    if (!inputData.aadhar) {
      toast.error("Aadhar number is required");
      isValid = false;
    } else if (inputData.aadhar.length !== 12) {
      toast.error("Invalid Aadhar number");
      isValid = false;
    }

    // Validate city
    if (!inputData.city) {
      toast.error("City is required");
      isValid = false;
    }

    // Validate password
    if (!inputData.password) {
      toast.error("Password is required");
      isValid = false;
    } else if (
      !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@#$!%*?&]{10,}$/.test(
        inputData.password
      )
    ) {
      toast.error(
        "Invalid Password: Minimum 10 characters, at least 1 letter and 1 number"
      );
      isValid = false;
    }

    return isValid; // Return whether all inputs are valid
  };

  const [open, setOpen] = useState(false);
  const [popError, setPopError] = useState("");

  const handleOpen = () => setOpen(!open);
  const [uploadingLoading, setUploadingLoading] = useState(false);
  const [open4, setOpen4] = useState(false);
  const handleOpen4 = () => setOpen4(!open4);
  const [otp, setOtp] = useState("");

  const handleChange = (e) => {
    setOtp(e.target.value);
  };
  function generateOTP() {
    // Generate a random number between 1000 and 9999
    const otp = Math.floor(1000 + Math.random() * 9000);
    return otp.toString();
  }
  const [generatedOTP, setGeneratedOtp] = useState();
  const SendingOtp = async () => {
    const isValid = validateInputs(); // Check validation

    // Stop execution if validation failed
    if (!isValid) return;

    // Checking if phone number or email exists

    const data = await axios.post(`/api/users/checking`, {
      phoneNumber: inputData.phoneNumber,
      email: inputData.email,
    });
    const user = await data.data;

    if (!user.success) {
      toast.error(user.message);
      return;
    }

    // Continue if inputs are valid
    const authkey = process.env.NEXT_PUBLIC_AUTH_KEY;
    const name = "service wallah account";
    const mobile = inputData.phoneNumber;
    const country_code = "+91";
    const SID = "13608";
    const otp = generateOTP();
    setGeneratedOtp(otp);

    const url = `https://api.authkey.io/request?authkey=${authkey}&mobile=${mobile}&country_code=${country_code}&sid=${SID}&company=${name}&otp=${otp}`;
    await axios.get(url);
    setOpen4(true);
  };

  const [otpError, setOtpError] = useState("");
  const handleRegisterServiceProvider = async (e) => {
    e.preventDefault();
    if (otp === undefined || otp !== generatedOTP) {
      setOtpError("Invalid OTP");
      return;
    }
    setUploadingLoading(true);
    const imageRef = ref(
      storage,
      `service-provider/${
        inputData.image.lastModified +
        inputData.image.size +
        inputData.image.name
      }`
    );
    await uploadBytes(imageRef, inputData.image);
    const imageUrl = await getDownloadURL(imageRef); // Get the image URL directly
    const imageObject = { url: imageUrl, name: imageRef._location.path_ };
    const postData = { ...inputData, image: imageObject };
    try {
      const response = await fetch("/api/service-providers/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      setOpen(true);
      setInputData({
        name: "",
        phoneNumber: "",
        email: "",
        image: {
          url: "",
          name: "",
        },
        gender: "",
        aadhar: "",
        city: "",
        password: "",
        role: "service-provider",
        active: false,
        image: null,
      });
      setUploadingLoading(false);
      console.log(response);
    } catch (error) {
      setOpen(true);
      setPopError(true);
      console.log("Something went wroung while regestering.", error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="area">
        <ul className="circles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
      <Dialog
        open={open4}
        handler={handleOpen4}
        size="sm"
        dismiss={{ enabled: false }}
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
      >
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-500">
            Verify OTP
          </h2>
          <form
            onSubmit={handleRegisterServiceProvider}
            className="flex flex-col gap-4"
          >
            <Input
              label="Enter OTP"
              maxLength={4}
              color="blue"
              value={otp}
              size="lg"
              minLength={4}
              onChange={handleChange}
            />
            {otpError && (
              <p className="text-red-500 flex gap-1 text-xs items-center">
                <FaInfoCircle />
                <span>{otpError}</span>
              </p>
            )}
            <p className="text-gray-600 flex gap-1 text-xs items-center">
              <FaInfoCircle />
              <span>
                Please enter the 4-digit OTP sent to your mobile number{" "}
                {inputData.phoneNumber}.
              </span>
            </p>

            <Button
              type="submit"
              color="blue"
              fullWidth
              className="flex justify-center"
              loading={uploadingLoading}
            >
              Verify OTP
            </Button>
          </form>
        </div>
      </Dialog>
      <Dialog
        open={open}
        handler={handleOpen}
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
      >
        {popError ? (
          <div className="p-6">
            <div className="flex justify-end items-center mb-4">
              <button
                onClick={() => window.location.reload()}
                title="Close"
                className="hover:scale-125 transition-all duration-500 ease-in-out "
              >
                <RxCross2 size={25} />
              </button>
            </div>
            <h1 className="text-2xl font-bold text-deep-orange-500 font-lato text-center">
              {popError}
            </h1>
            <p className="text-center">Please Try Again later.</p>
            <div className="w-full flex justify-center my-4">
              <Button
                variant="gradient"
                className="rounded-md"
                color="blue"
                onClick={() => window.location.reload()}
              >
                <span>Understood</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex justify-end items-center mb-4">
              <button
                onClick={handleOpen}
                title="Close"
                className="hover:scale-125 transition-all duration-500 ease-in-out "
              >
                <RxCross2 size={25} />
              </button>
            </div>
            <h1 className="text-2xl font-bold text-teal-500 font-lato text-center">
              You Registered Successfully
            </h1>
            <p className="text-center">
              Wait For admin to approve Your account
            </p>
            <div className="w-full flex justify-center my-4">
              <Button variant="gradient" className="rounded-md" color="blue">
                <button
                  onClick={() => {
                    window.location.href = "/";
                  }}
                >
                  Understood
                </button>
              </Button>
            </div>
          </div>
        )}
      </Dialog>
      <div className="min-h-full flex justify-center mb-8">
        <div className="flex w-full md:w-2/5 flex-col gap-5 items-center px-8 py-6 h-[85vh] no-scrollbar overflow-auto bg-white bg-opacity-75 border shadow-lg backdrop-blur-sm rounded-xl">
          <div className="w-full flex flex-col items-center justify-center">
            <h2 className="uppercase font-bold text-3xl font-julius text-blue-600">
              Become a service provider
            </h2>
            {/* <p>Sign up Now!</p> */}
          </div>
          <div className="w-full flex flex-col gap-4 justify-center">
            <Input
              label="Name"
              color="indigo"
              value={inputData.name}
              maxLength={25}
              onChange={(e) =>
                setInputData({ ...inputData, name: e.target.value })
              }
            />
            <Input
              label="Aadhaar Number"
              color="indigo"
              value={inputData.aadhar}
              minLength={12}
              maxLength={12}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/\D/g, ""); // Only allows digits
              }}
              onChange={(e) =>
                setInputData({ ...inputData, aadhar: e.target.value })
              }
            />
            <Input
              label="Phone Number"
              color="indigo"
              value={inputData.phoneNumber}
              minLength={10}
              maxLength={10}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/\D/g, ""); // Only allows digits
              }}
              onChange={(e) =>
                setInputData({ ...inputData, phoneNumber: e.target.value })
              }
            />
            <Input
              label="Email"
              color="indigo"
              type="email"
              value={inputData.email}
              onChange={(e) =>
                setInputData({ ...inputData, email: e.target.value })
              }
            />
            <Select
              label="Gender"
              color="indigo"
              value={inputData.gender}
              onChange={(e) => setInputData({ ...inputData, gender: e })}
            >
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
            </Select>
            <Input
              label="City"
              color="indigo"
              value={inputData.city}
              onChange={(e) =>
                setInputData({ ...inputData, city: e.target.value })
              }
            />

            <div className="flex items-center gap-2 relative">
              <Input
                label="Password"
                color="indigo"
                type={showPassword ? "text" : "password"}
                minLength={10}
                maxLength={25}
                value={inputData.password}
                onChange={(e) =>
                  setInputData({ ...inputData, password: e.target.value })
                }
              />
              <div
                className="absolute right-14 top-2.5 p-0 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <AiOutlineEye size={20} color="gray" />
                ) : (
                  <AiOutlineEyeInvisible size={20} color="gray" />
                )}
              </div>
              <Tooltip
                content="Password should be more than 10 characters long including letters and numbers"
                placement="top-end"
                className="origin-bottom-right"
                animate={{
                  mount: { scale: 1, y: -5 },
                  unmount: { scale: 0, y: 0 },
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-8 w-8 cursor-pointer text-blue-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              </Tooltip>
            </div>
            <div className="flex gap-2 cursor-pointer">
              <label htmlFor="icon" className="text-nowrap">
                Profile Image
              </label>
              <input
                className="relative m-0 block w-full min-w-0 flex-auto cursor-pointer rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-xs font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:cursor-pointer file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"
                type="file"
                onChange={(e) =>
                  setInputData({ ...inputData, image: e.target.files[0] })
                }
                id="icon"
              />
            </div>
            <Button
              // loading={uploadingLoading}
              fullWidth
              variant="gradient"
              color="blue"
              onClick={SendingOtp}
              className="hover:scale-105 transition-all duration-700 flex items-center justify-center py-4 rounded-md shadow-2xl cursor-pointer text-white"
            >
              Verify Mobile Number
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateServiceProvider;
