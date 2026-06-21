import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Tests() {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/tests"
      );

      setTests(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Available Tests
      </h1>

      <div className="grid gap-4">
        {tests.map((test) => (
          <div
            key={test._id}
            className="bg-white p-5 rounded shadow"
          >
            <h2 className="text-xl font-bold">
              {test.title}
            </h2>

            <p>{test.description}</p>

            <p>
              Category: {test.category}
            </p>

            <p>
              Duration: {test.duration} mins
            </p>
            <p>
  Type:{" "}
  <span
    className={`font-semibold ${
      test.testType === "mcq"
        ? "text-green-600"
        : "text-purple-600"
    }`}
  >
    {test.testType === "mcq" ? "MCQ Test" : "Coding Test"}
  </span>
</p>
           <Link
  to={
    test.testType === "mcq"
      ? `/test/${test._id}`
      : `/coding-test/${test._id}`
  }
  className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded"
>
  Start Test
</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tests;