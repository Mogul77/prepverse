import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ManageTests() {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/tests"
      );

      setTests(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this test?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/tests/${id}`
      );

      fetchTests();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">
        Manage Tests
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
            <span
  className={`inline-block mt-2 px-3 py-1 rounded-full text-white text-sm ${
    test.testType === "mcq"
      ? "bg-green-600"
      : "bg-purple-600"
  }`}
>
  {test.testType === "mcq"
    ? "MCQ"
    : "CODING"}
</span>

            <p>{test.description}</p>

            <p>Category: {test.category}</p>

            <p>Duration: {test.duration} mins</p>

            {/* ACTION BUTTONS */}
            <div className="mt-4 flex gap-3">

             <Link
  to={
    test.testType === "mcq"
      ? `/add-question/${test._id}`
      : `/add-coding-questions/${test._id}`
  }
  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
>
  {test.testType === "mcq"
    ? "Add MCQ Questions"
    : "Add Coding Questions"}
</Link>
              <button
                onClick={() =>
                  handleDelete(test._id)
                }
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete Test
              </button>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}

export default ManageTests;