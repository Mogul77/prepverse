import { useState } from "react";
import axios from "axios";

function CreateTest() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [testType, setTestType] = useState("mcq");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/tests",
        {
          title,
          description,
          category,
          duration,
          testType,
          questions: [],
        }
      );

      alert("Test Created Successfully");

      setTitle("");
      setDescription("");
      setCategory("");
      setDuration("");
    } catch (error) {
      console.log(error);
      alert("Failed to create test");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">

        <h1 className="text-3xl font-bold mb-6">
          Create Test
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            type="text"
            placeholder="Test Title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className="w-full border p-3 rounded"
            required
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            className="w-full border p-3 rounded"
            required
          />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="w-full border p-3 rounded"
            required
          />
          <div className="mb-4">
  <label className="block font-semibold mb-2">
    Test Type
  </label>

  <select
    value={testType}
    onChange={(e) => setTestType(e.target.value)}
    className="w-full border rounded p-3"
  >
    <option value="mcq">MCQ Test</option>
    <option value="coding">Coding Test</option>
  </select>
</div>

          <input
            type="number"
            placeholder="Duration (minutes)"
            value={duration}
            onChange={(e) =>
              setDuration(e.target.value)
            }
            className="w-full border p-3 rounded"
            required
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded"
          >
            Create Test
          </button>

        </form>

      </div>

    </div>
  );
}

export default CreateTest;