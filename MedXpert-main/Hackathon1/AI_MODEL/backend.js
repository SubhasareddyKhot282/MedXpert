

import express from "express";
import bodyParser from "body-parser";
import database from "./db.js"; // Assume this is your database connection utility
import Auth from "../src/modules/userAuth.js"

const app = express();
app.use(bodyParser.json()); // Parse JSON body

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        try {
            const response = await fetch("http://localhost:5000/generate_report", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.error) {
                alert(data.error);
            } else {
                const recommended_doctor = data.recommended_doctor;
                console.log("Recommended Doctor:", recommended_doctor);

                // Send data to the server for comparison
                const compareResponse = await fetch("/api/data", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        recommended_doctor: recommended_doctor,
                    }),
                });

                const compareData = await compareResponse.json();

                if (compareData.error) {
                    alert(compareData.error);
                } else {
                    console.log("Matched Doctors:", compareData.doctors);

                    // Update the UI with matched doctor details
                    const resultSection = document.querySelector(".result-section .report-content");
                    resultSection.innerHTML = `<h3>Recommended Doctor:</h3>
                        <p>${recommended_doctor}</p>
                        <h3>Matched Doctors:</h3>`;

                    compareData.doctors.forEach((doctor) => {
                        const doctorDetails = document.createElement("div");
                        doctorDetails.innerHTML = `
                            <p>Name: ${doctor.Name}</p>
                            <p>Speciality: ${doctor['Doctor Specialization']}</p>
                            <p>Contact: ${doctor.Contact}</p>
                            <hr>`;
                        resultSection.appendChild(doctorDetails);
                    });
                }
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Please try again.");
        }
    });
});

app.post("/api/data", async (req, res) => {
    const { recommended_doctor } = req.body;

    if (!recommended_doctor) {
        return res.status(400).json({ error: "Doctor specialization is required" });
    }

    try {
        const db = await database(); // Connect to the database

        const doctors = await Auth.find({
            role: "doctor",
            speciality: recommended_doctor,
        }).toArray();
 
         console.log("Doctors: ",doctors)

        if (doctors.length === 0) {
            return res.status(404).json({ error: "No matching doctors found" });
        }

        console.log("Matching doctors:", doctors);  // ✅ Fixed typo here
        res.json({ doctors });
        
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Database connection
database()
  .then(() => {
    console.log("DB connected");
    app.listen(3000, () => console.log("Listening at port 3000"));
  })
  .catch((error) => {
    console.error("DB connection failed:", error);
  });
