import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { server } from "../../main";
import Loading from "../../Loding";

const Verify = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const params = useParams();

  async function verifyUser() {
    try {
      const { data } = await axios.post(
        `${server}/api/v1/verify/${params.token}`
      );
      setSuccessMessage(data.message);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    verifyUser();
  }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
              {successMessage ? (
                <>
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-3">
                    Verification Successful!
                  </h2>
                  <p className="text-green-600 font-semibold text-lg mb-8">
                    {successMessage}
                  </p>
                  <Link
                    to="/login"
                    className="inline-block bg-[#387ED1] hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition duration-200"
                  >
                    Go to Login
                  </Link>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-3">
                    Verification Failed
                  </h2>
                  <p className="text-red-600 text-lg mb-8">
                    {errorMessage}
                  </p>
                  <Link
                    to="/register"
                    className="inline-block bg-[#387ED1] hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition duration-200"
                  >
                    Back to Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Verify;