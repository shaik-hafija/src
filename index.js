const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const collection = require("./mongodb")
const UserUserDeatials = require("./useruserdetails")
const AdminUserDetails = require("./adminuserdetails")
const Userlogin = require("./userlogin")
const AdminControl = require("./admincontrol")
const templatePath = path.join(__dirname, '../templates')
const session = require('express-session');
// ... other imports

// Use express-session middleware
app.use(session({
    secret: 'your-secret-key', // Change this to a strong secret key
    resave: false,
    saveUninitialized: true,
}));

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.set("view engine", "hbs")
app.set("views", templatePath)
app.listen(3000, () => {
    console.log('port is connected')
})
app.get("/", (req, res) => {
    res.render('Admin')
})
app.post("/admin", async (req, res) => {
    const data = {
        userid: req.body.userid,
        password: req.body.password
    };



    if (data.userid === "admin123@gmail.com" && data.password === "admin") {
        await collection.insertMany([data]);
        res.render("home");
    } else {
        res.status(401).json({ error: "Invalid credentials. Enter the correct details." });
    }
});
// app.post('/userlogin', async (req, res) => {
//     const userData = {
//         uuserid: req.body.uuserid,
//         upassword: req.body.upassword,
//     };

//     try {
//         await Userlogin.insertMany([userData]);

//         // Store user details in session (install and configure express-session middleware)
//         req.session.user = {
//             uuserid: userData.uuserid,
//             upassword: userData.upassword,
//         };

//         res.render("userHome");
//     } catch (error) {
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

app.post('/create-user', async (req, res) => {
    const userData = {
        uuserid: req.body.uuserid,
        upassword: req.body.upassword,
    }
    try {
        await AdminUserDetails.insertMany([userData]);
        res.render("Home");
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.post('/userlogin', async (req, res) => {
    const enteredUserId = req.body.uuserid;
    const enteredPassword = req.body.upassword;

    try {
        // Check if the entered credentials match AdminUserDetails
        const adminUser = await AdminUserDetails.findOne({ uuserid: enteredUserId, upassword: enteredPassword });

        if (adminUser) {
            // If credentials match, insert user details into Userlogin
            const userData = {
                uuserid: enteredUserId,
                upassword: enteredPassword,
            };

            await Userlogin.insertMany([userData]);

            // Store user details in session (install and configure express-session middleware)
            req.session.user = {
                uuserid: userData.uuserid,
                upassword: userData.upassword,
            };

            res.render("userHome");
        } else {
            // If credentials don't match, render an error page or redirect to the login page
            res.status(401).json({ error: 'Invalid credentials' });
            // Alternatively, you can redirect to the login page
            // res.redirect('/login');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/retrieve-users', async (req, res) => {
    try {
        const { userid1, userid2 } = req.query;

        // Ensure both user IDs are provided
        if (!userid1 || !userid2) {
            return res.status(400).json({ error: 'Both userid1 and userid2 are required' });
        }

        // Fetch users based on user IDs
        const users = await AdminControl.find({ uuserid: { $in: [userid1, userid2] } });

        res.render('adminuserdetails', { users });
        console.log('Users:', users);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/combineData', async (req, res) => {
    try {
        // Fetch data from AdminControl to get the existing uuserids
        const existingAdminControlData = await AdminControl.find().lean();
        const existingUserIds = new Set(existingAdminControlData.map(admin => admin.uuserid));

        // Fetch data from AdminUserDetails and UserUserDeatials
        const adminData = await AdminUserDetails.find().lean();
        const userData = await UserUserDeatials.find().lean();

        // Combine data for uuserids that are not present in AdminControl
        const combinedData = adminData.map((admin, index) => {
            if (!existingUserIds.has(admin.uuserid)) {
                const user = userData[index] || {}; // Use empty object if index exceeds user array length
                return {
                    uuserid: admin.uuserid,
                    upassword: admin.upassword,
                    uname: user.uname || '', // Use empty string if uname is undefined
                    uphoto: user.uphoto || '', // Use empty string if uphoto is undefined
                    status: 0, // Initialize status to 0
                };
            }
            return null; // Skip combining for existing uuserids
        }).filter(combined => combined !== null); // Filter out null entries

        // Insert the combined data into AdminControl
        await AdminControl.insertMany(combinedData);

        res.json({ message: 'Data combined and inserted into admincontrolltable' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.post('/markAsDone', async (req, res) => {
    console.log(req.body);
    const { uuserid } = req.body;

    try {
        // Update the status to 1 when the admin clicks the "Done" button
        const result = await AdminControl.updateOne({ uuserid }, { $set: { status: 1 } });

        if (result.nModified === 1) {
            res.json({ message: 'Profile accepted by admin' });
        } else {
            res.status(404).json({ error: 'User not found or status not updated' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




app.post('/useruserdetails', async (req, res) => {
    const userData = {
        uname: req.body.uname,
        uphoto: req.body.uphoto,
    };

    await UserUserDeatials.insertMany([userData]);
    res.render("userHome");



});

app.get('/viewuserprofile', async (req, res) => {
    // Retrieve user details from session
    const user = req.session.user;

    if (!user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        // Fetch the corresponding user profile using the stored user details
        const userProfile = await AdminControl.findOne({ uuserid: user.uuserid }).lean().exec();

        if (!userProfile) {
            return res.status(404).json({ error: 'User profile not found' });
        }

        // Render a view template with the user profile data and status check
        res.render('user-details', {
            userProfile,
            statusMessage: userProfile.status === 0 ? 'Profile not accepted by admin' : 'Profile accepted by admin'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// app.get('/user/:userid', async (req, res) => {
//     const userid = req.params.userid;

//     try {
//         const user = await User.findOne({ userid });
//         res.render('user-details', { user });
//     } catch (error) {
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });
