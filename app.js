const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminModel = require('./models/admin');
const professionalModel = require('./models/professionals'); 
const path = require('path')


const multer = require('multer');
const profileModel = require('./models/profie');
const clientModel = require('./models/client');
const questionModel = require('./models/question');
const projectModel = require('./models/projects')
const postModel = require('./models/post')
const productModel = require('./models/products');
const feedbackModel = require('./models/feedback')
const requirementModel = require('./models/requirements')
const { appendFile } = require('fs');

const app = express()
app.use(express.json())
app.use(cors())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect("mongodb+srv://Nevin:nevintensonk@cluster0.0rfrr.mongodb.net/buildfinder?retryWrites=true&w=majority&appName=Cluster0")

const storage =  multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now()
        cb(null, uniqueSuffix + file.originalname)
    }
})

const projectStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/projects/') // Project images go here
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname
        cb(null, uniqueSuffix)
    }
});

const postStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/posts/') // Project images go here
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname
        cb(null, uniqueSuffix)
    }
});

const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/products')

    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '_' + file.originalname
        cb(null, uniqueSuffix)
    }
})

const upload = multer({storage:storage})
const uploadProjectImages = multer({ storage: projectStorage })
const uploadPostImages = multer({storage:postStorage})
const uploadProductImages = multer({storage:productStorage})



const imageUpload = uploadProjectImages.any(); // Accepts any field with files
const postImageUpload = uploadPostImages.any();
const productImageUpload = uploadProductImages.any()

app.get('/getFullProjectDetails/:projectId', async (req, res) => {
    const { projectId } = req.params;
  
    try {
      // Fetch project details using the projectId from the database
      const projectDetails = await projectModel.findById(projectId);
  
      if (!projectDetails) {
        return res.status(404).json({ message: 'Project not found' });
      }
  
      // Send project details in response
      console.log(projectDetails)
      res.status(200).json(projectDetails);
    } catch (error) {
      console.error('Error fetching project details:', error);
      res.status(500).json({ message: 'An error occurred while fetching project details' });
    }
  });

app.get('/projects/:professionalId', async (req, res) => {
    const { professionalId } = req.params;
    try {
      const projects = await projectModel.find({ professionalId }); // Fetch projects where the professionalId matches
      res.status(200).json(projects);
      console.log(projects)
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ message: 'Failed to fetch projects. Please try again later.' });
    }
  });

app.post('/updateStatus', async (req, res) => {
    const { professionalId } = req.body;
    console.log(professionalId)
  
    try {
      await profileModel.findOneAndUpdate(
        { userId: professionalId },
        { Status: 'Currently Occupied' }
      );
      res.status(200).json({ message: 'Status updated to Currently Occupied' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update status', error });
    }
  });

app.post('/getJobOffers', async (req, res) => {
    const { professionalId } = req.body;
    console.log(professionalId)
    try {
      const jobOffers = await requirementModel.find({ professionalId }).populate('clientId', 'name');
      console.log(jobOffers)
      res.status(200).json(jobOffers);
    } catch (error) {
      console.error('Error fetching job offers:', error);
      res.status(500).json({ message: 'Failed to load job offers. Please try again later.' });
    }
  });

app.post('/getfeedback', async (req, res) => {
    const userId = req.body.professionalId;
    console.log("Professional ID:", userId);

    try {
        // Populate 'clientId' to get client details (name, etc.) from the 'clients' collection
        const feedbacks = await feedbackModel.find({ professionlId: userId })
            .populate('clientid', 'name'); // Adjust 'name' to the actual field name in the clients schema for the client’s name

        console.log("Feedbacks with client details:", feedbacks);
        res.status(200).json(feedbacks);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ message: 'Failed to load feedback. Please try again later.' });
    }
});

app.post('/addJobRequirement/:userId', async (req, res) => {
    try {
      console.log(req.body)
      const { clientId, jobType, location, description, budget, area, timeline } = req.body;
      const  professionalId  = req.params.userId;
      console.log(professionalId)
  
      // Validate that all required fields are provided
      if (!clientId || !professionalId || !jobType || !location || !description || !budget || !area || !timeline) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      // Create a new requirement instance
      const newRequirement = new requirementModel({
        clientId,
        professionalId,
        jobType,
        location,
        description,
        budget,
        area,
        timeline,
      });
  
      // Save the requirement to the database
      await newRequirement.save();
      res.status(201).json({ message: 'Job requirement added successfully' });
    } catch (error) {
      console.error('Error adding job requirement:', error);
      res.status(500).json({ message: 'Failed to add job requirement. Please try again later.' });
    }
  });

app.post('/addFeedback/:userId', async (req, res) => {
    try {
        // Get the clientId from the session storage (or use your preferred auth mechanism)
        
        // Extract the professionalId from request parameters
        const professionalId = req.params.userId;
        console.log(professionalId)

        // Extract feedback from the request body
        console.log(req.body)
        const { feedback, clientId } = req.body;
        
        if (!feedback || !professionalId) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        // Create a new feedback document
        const newFeedback = new feedbackModel({
            clientid: clientId,
            professionlId: professionalId,
            feedback: feedback
        });

        // Save the feedback to the database
        await newFeedback.save();

        res.status(201).json({ message: 'Feedback submitted successfully!' });
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).json({ message: 'Failed to submit feedback. Please try again later.' });
    }
});

app.get('/professionals/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Fetch profile details from the database
      const profile = await profileModel.findOne({ userId: userId });
  
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
  
      // Return the profile data
      return res.status(200).json(profile);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      return res.status(500).json({ message: 'Server error' });
    }
  });

app.put('/editProfile', upload.single('profilepic'), async (req, res) => {
    const token = req.headers.token;

    jwt.verify(token, "builderstoken", async (error, decoded) => {
        if (error || !decoded) {
            return res.json({ "Status": "Invalid Authentication" });
        }

        try {
            // Get userId and updates from request
            const userId = req.body.userId;
            const updates = req.body.updates || {}; // Check if updates exists
            
            // If profile picture exists, add it to updates
            if (req.file) {
                updates.profilepic = req.file.filename;
            }

            // Update the profile in the database
            const updatedProfile = await profileModel.findOneAndUpdate(
                { userId: userId },
                { $set: updates },
                { new: true }
            );

            if (!updatedProfile) {
                return res.status(404).json({ "Status": "Profile not found or unauthorized access" });
            }

            res.status(200).json({ "Status": "Profile updated successfully", updatedProfile });
        } catch (error) {
            console.error(error);
            res.status(500).json({ "Status": "Error updating the profile", error: error.message });
        }
    });
});

app.delete('/deleteProduct/:productId', async (req, res) => {
    const token = req.headers.token;
  
    // Verify token
    jwt.verify(token, "builderstoken", async (error, decoded) => {
      if (error || !decoded) {
        return res.status(401).json({ "Status": "Invalid Authentication" });
      }
  
      try {
        const { productId } = req.params;
  
        // Find and delete the product
        const deletedProduct = await productModel.findOneAndDelete({
          _id: productId,
           
        });
  
        // Check if the product was found and deleted
        if (!deletedProduct) {
          return res.status(404).json({ "Status": "Product not found or unauthorized access" });
        }
  
        res.status(200).json({ "Status": "Product deleted successfully" });
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ "Status": "Error deleting product", error: error.message });
      }
    });
  });
  
app.put('/editProduct', async (req, res) => {
    const token = req.headers.token;
  
    // Verify the token
    jwt.verify(token, "builderstoken", async (error, decoded) => {
      if (error || !decoded) {
        return res.json({ "Status": "Invalid Authentication" });
      }
  
      try {
        const { productId, professionalId, updates } = req.body;
  
        // Update the product with new details if the professionalId matches
        const updatedProduct = await productModel.findOneAndUpdate(
          { _id: productId, professionalId: professionalId },  // Match by productId and professionalId
          { $set: updates },  // Apply updates
          { new: true }       // Return the updated document
        );
  
        // Check if the product was found and updated
        if (!updatedProduct) {
          return res.status(404).json({ "Status": "Product not found or unauthorized access" });
        }
  
        res.status(200).json({ "Status": "Product updated successfully", updatedProduct });
      } catch (error) {
        console.error(error);
        res.status(500).json({ "Status": "Error updating the product", error: error.message });
      }
    });
  });
  
app.post("/ClientViewAllProjects", async (req, res) => {
    const { style, cost } = req.body; // Optional filters
    const token = req.headers.token;

    // Verify the JWT token
    jwt.verify(token, "clienttoken", async (error, decoded) => {
      if (error || !decoded) {
        return res.status(401).json({ Status: "Invalid Authentication" });
      }

      try {
        // Create the filter object for query based on optional inputs
        const filter = {};
        if (style) filter.style = style; // Adjusted filter for style directly on project level
        if (cost) filter.workcost = { $lte: cost }; // Adjusted filter for cost directly on project level

        // Fetch projects from projectModel with the optional filters
        const projects = await projectModel.find(filter).select(
          '_id projectTitle projectType location clientname startdt enddt workcost constructionType builtUpArea bedrooms style plotSize scope Description categories'
        );

        if (!projects || projects.length === 0) {
          return res.status(404).json({ message: 'No projects found matching the criteria.' });
        }

        // Format the response with the required data
        const formattedProjects = projects.map((project) => ({
          id: project._id,
          title: project.projectTitle,
          projectType: project.projectType,
          location: project.location,
          clientname: project.clientname,
          startdt: project.startdt,
          enddt: project.enddt,
          workCost: project.workcost,
          constructionType: project.constructionType,
          builtUpArea: project.builtUpArea,
          bedrooms: project.bedrooms,
          style: project.style,
          plotSize: project.plotSize,
          scope: project.scope,
          description: project.Description,
          // Extract all images from nested categories
          images: project.categories.flatMap((category) =>
            category.images.map((img) => img.url)
          ),
        }));

        res.json(formattedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Server error while fetching projects.' });
      }
    });
});

app.post('/getProducts', async (req, res) => {
    const token = req.headers.token;
  
    // Verify the token
    jwt.verify(token, "clienttoken", async (error, decoded) => {
      if (error || !decoded) {
        return res.json({ "Status": "Invalid Authentication" });
      }
  
      try {
        const { productName } = req.body;  // Fetch productName from query params
  
        let query = {};
        if (productName) {
          // If productName is provided, add it to the query
          query = { productName: { $regex: productName, $options: 'i' } };  // Case-insensitive search
        }
  
        // Find products based on the query
        const products = await productModel.find(query);
  
        // If no products are found
        if (products.length === 0) {
          return res.json({ "Status": "No products found" });
        }
  
        // Respond with the products
        res.status(200).json(products);
      } catch (error) {
        console.error(error);
        res.status(500).json({ "Status": "Error retrieving products", error: error.message });
      }
    });
  });

app.post('/getProfessionalProducts', async (req, res) => {
    const token = req.headers.token;
  
    // Verify the token
    jwt.verify(token, "builderstoken", async (error, decoded) => {
      if (error || !decoded) {
        return res.json({ "Status": "Invalid Authentication" });
      }
  
      try {
        const professionalId = req.body
  
        // Find all products by professionalId
        const products = await productModel.find( professionalId );
  
        // If no products are found
        if (products.length === 0) {
          return res.json({ "Status": "No products found for this professional" });
        }
  
        // Respond with the products
        res.status(200).json(products);
      } catch (error) {
        console.error(error);
        res.status(500).json({ "Status": "Error retrieving products", error: error.message });
      }
    });
  });
  
app.post('/addProducts', productImageUpload, async (req, res) => {
    const token = req.headers.token;
  
    // Verify the token
    jwt.verify(token, "builderstoken", async (error, decoded) => {
      if (error || !decoded) {
        return res.json({ "Status": "Invalid Authentication" });
      }
  
      try {
        // Extract product data from request body
        const { professionalId, productName, cost, discount, productDetails, specification, soldBy, description } = req.body;
  
        // Extract images uploaded by multer
        const productImages = req.files.map(file => ({
          url: file.filename // Saving relative paths to productImages
        }));
  
        // Create the new product
        const newProduct = new productModel({
          professionalId,
          productName,
          cost,
          discount,
          productDetails,
          specification,
          soldBy,
          description,
          productImages, // Assigning the uploaded image URLs to productImages array
        });
  
        // Save the product to the database
        await newProduct.save();
  
        // Respond with success
        res.status(201).json(
          
           newProduct
        );
      } catch (error) {
        console.error(error);
        res.status(500).json({ "Status": "Error while adding the product", error: error.message });
      }
    });
  });
  
app.post('/getAllPosts', async (req, res) => {
    const token = req.headers.token;
    console.log(token) // Get the token from request headers
  
    jwt.verify(token, "clienttoken", async (error, decoded) => {
      if (error || !decoded) {
        return res.status(401).json({ "Status": "Invalid Authentication" }); // Unauthorized access
      }
  
      try {
        // Fetch all posts from the database
        const posts = await postModel.find() // Optionally populate professional data
        
        res.status(200).json(  posts );
      } catch (err) {
        console.error(err);
        res.status(500).json({ "Status": "Error while fetching posts", error: err.message });
      }
    });
  });
  
app.post('/viewAllPosts', async (req, res) => {
    const token = req.headers.token;

    jwt.verify(token, "builderstoken", async (error, decoded) => {
        if (error || !decoded) {
            return res.status(401).json({ "Status": "Invalid Authentication" });
        }

        try {
            const { professionalId } = req.body;
            

            // Find posts for the given professionalId
            const posts = await postModel.find({professionalId });

            if (posts.length === 0) {
                return res.status(404).json({ "Status": "No posts found" });
            }

            res.json({ "Status": "Posts fetched successfully", posts });
        } catch (err) {
            console.error('Error fetching posts:', err);
            res.status(500).json({ "Status": "Error fetching posts", error: err.message });
        }
    });
});

app.post('/uploadPost',postImageUpload,async(req, res) => {
    const token = req.headers.token

    jwt.verify(token,"builderstoken",async(error, decoded) => {
        if (error || !decoded) {
            res.json({"Status":"Invalid Authentication"})
        }

        try {
            const { professionalId, description, cost } = req.body;

            const images = req.files.map(file => ({
                url:file.filename,
              }));

              const newPost = new postModel({
                professionalId,
                postedImages: images,
                description: description || '', // Optional field
                cost: cost || null, // Optional field
              });

              await newPost.save();
              res.json({"Status":"Post Added Successfully",post: newPost});
        }catch (err) {
            console.error(err);
            res.json({"Status":"Error while adding the post",error:err.messa})
        }

    })
})

app.post('/getFullProjectDetails/:id', async (req, res) => {
    console.log(req.params.id)
    try {
        const project = await projectModel.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project details', error });
    }
});

app.post("/ProfessionalViewProject", async (req, res) => {
    const input = req.body;
    const token = req.headers.token;
  
    // Verify the JWT token
    jwt.verify(token, "builderstoken", async (error, decoded) => {
      if (error || !decoded) {
        return res.status(401).json({ Status: "Invalid Authentication" });
      }
  
      try {
        // Fetch projects for the authenticated professional
        const projects = await projectModel.find(input).select(
          '_id projectTitle categories clientname startdt enddt'
        );
  
        if (!projects || projects.length === 0) {
          return res.status(404).json({ message: 'No projects found for this professional.' });
        }
  
        // Format the response with the required data
        const formattedProjects = projects.map((project) => ({
          id: project._id,
          title: project.projectTitle,
          clientName: project.clientname,
          startDate: project.startdt,
          endDate: project.enddt,
          // Extract all images from nested categories
          images: project.categories.flatMap((category) =>
            category.images.map((img) => img.url)
          ),
        }));
  
        res.json(formattedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Server error while fetching projects.' });
      }
    });
  });
  
app.post('/addProject', imageUpload, async (req, res) => {
    const token = req.headers.token;
    console.log(token)

    jwt.verify(token, "builderstoken", async (error, decoded) => {
        if (error || !decoded) {
            return res.json({ Status: "Invalid Authentication" });
        }

        try {
            const {
                professionalId, projectTitle, projectType, location, clientname,
                startdt, enddt, workcost, constructionType, builtUpArea, bedrooms,
                style, plotSize, scope, Description
            } = req.body;

            let categoriesParsed = [];
            if (req.body.categories) {
                categoriesParsed = JSON.parse(req.body.categories);
            }

            const projectExist = await projectModel.findOne({ professionalId, projectTitle });
            if (projectExist) {
                return res.json({ "Status": "Project already exists" });
            }

            // Group images by category
            const categoriesWithImages = categoriesParsed.map((category, index) => ({
                title: category.title,
                images: req.files
                    .filter(file => file.fieldname === `images-${index}`) // Match based on fieldname
                    .map(file => ({ url: file.filename }))
            }));

            const newProject = new projectModel({
                professionalId, projectTitle, projectType, location, clientname,
                startdt, enddt, workcost, constructionType, builtUpArea, bedrooms,
                style, plotSize, scope, Description, categories: categoriesWithImages
            });

            await newProject.save();
            res.json({ "Status": "Project Added Successfully", project: newProject });

        } catch (err) {
            console.error(err);
            res.status(500).json({ Status: "Error while adding project", error: err.message });
        }
    });
});

app.post("/seeAnswers", async (req, res) => {
    let input = req.body
    console.log(input)
    let token = req.headers.token;
    console.log(token)
    jwt.verify(token, "clienttoken", async (error, decoded) => {
        if (decoded && decoded.emailid) {  // Check if user is authenticated
            console.log(decoded.emailid)
            try {
                const questions = await questionModel.find(
                  input  // Filter questions by client ID
                ).populate(
                    'answers.professionalId', 'name'
                ).exec()
                console.log(questions)
                res.json({ "Status": "Success", questions });
            } catch (err) {
                res.json({ "Error": err.message });
            }
        } else if (error) {
            res.json({ "Status": error.message });
        } else {
            res.json({ "Status": "Invalid Authentication" });
        }
    });
});

app.post("/setAnswer", async(req, res) => {
    let answer = req.body
    console.log(answer)
    let token = req.headers.token
    jwt.verify(token, "builderstoken", async(error, decoded) => {
        if (decoded && decoded.emailid) {
            const newAnswer =  {
                professionalId:req.body.professionalId,
                answer:req.body.answer
            }
            await questionModel.findByIdAndUpdate(
                req.body.questionId,
                {$push: {
                    answers: newAnswer
                }}
            )
            res.json({"Status":"Answer added Successfully"})
            
        }else{
            res.json({"Error":error.message})
        }
    }).catch(
        (error) => {
            res.json({"Status":error.message})
        }
    )
})

app.post("/getQuestions", async(req, res) => {
    let field = req.body
    console.log(field)
    let token = req.headers.token
    jwt.verify(token,"builderstoken", async(error, decoded) => {
        if (decoded && decoded.emailid) {
           let questions = await questionModel.find(field).populate(
                "ClientId","name"
           ).exec()
                
                    if(questions.length > 0) {
                        console.log(questions)
                        res.json(questions)
                    }else{
                        res.json({"Status":"No Questions"})
                    }
                
            
        } else {
            res.json({"Error":error.message})
        }
    })
})

app.post("/askQuestion", async(req, res)=> {
    let question = req.body
    console.log(question)
    let token = req.headers.token
    jwt.verify(token, "clienttoken",async(error, decoded) => {
        if (decoded && decoded.emailid) {
            let questions = new questionModel(question)
            await questions.save()
            
            res.json({"Status":"Success"})
        } else if (error){
            
                res.json({"Error":"Error"})
                
            }
        }
)})

app.post("/searchDesigns", (req, res) => {
    let clientInput = req.body
    console.log(clientInput)
    let token = req.headers.token
    jwt.verify(token, "clienttoken",(error,decoded) => {
        if (decoded && decoded.emailid) {
            console.log(decoded.emailid)
            profileModel.find(clientInput).then(
                (items) => {
                    if (items.length == 0) {
                        res.json({"Status":"No result"})
                    } else {
                        res.json(items)
                    }   
                }
            ).catch(
                (error) =>{
                    res.json({"Error":error.message})
                }
            )
        } else {
            res.json({"Status":"Invalid Authentication"+error.message})
        }
    })

})

app.post("/builderDashboard", (req, res) => {
    let input = req.body
    let token = req.headers.token
    jwt.verify(token, "builderstoken", (error,decoded) => {
        if (decoded && decoded.emailid) {
            profileModel.find(input).then(
                (items) => {
                    res.json(items)
                }
            ).catch(
                (error) => {
                    res.json({"Error":error.message})
                }
            )
        }
        
    } )
})

app.post("/clientsignin", async(req, res) => {
    let client = req.body
    clientModel.find({emailid:client.emailid}).then(
        (detail) => {
            if (detail.length == 0) {
                res.json({"Status":"invalid Emailid"})
                
            } else {
                let passcheck = bcrypt.compareSync(client.password,detail[0].password)
                if (passcheck) {
                    jwt.sign({emailid:client.emailid},"clienttoken",{expiresIn:"1d"},(error, token) => {
                        if (error) {
                            res.json({"Status":"Error","Error":error})
                        }
                        else {
                            res.json({"Status":"Success","token":token,"userid":detail[0]._id,"name":detail[0].name})
                        }
                    })
                    
                } else {
                    res.json({"Status":"Incorrect Password"})
                }
            }
        }
    )
})

app.post("/clientsignup", async(req, res) => {
    let clientdetails = req.body
    let hashedpswd = bcrypt.hashSync(clientdetails.password,10)
    clientdetails.password = hashedpswd
    clientModel.find({emailid:clientdetails.emailid}).then(
        (items) => {
            if (items.length == 0){
                let clients = new clientModel(clientdetails)
                clients.save()
                res.json({"Status":"Success"})
            }
            else{
                res.json({"Status":"Email id already existing"})
            }
        }
    )
})

app.post("/profile",upload.single('profilepic'), async(req, res) => {

    let token = req.headers.token
    console.log(token)
    jwt.verify(token,"builderstoken",async(error, decoded)=> {
        if (decoded && decoded.emailid){
           let profileExist = await profileModel.find({userId:req.body.userId}) 
           console.log(profileExist)
            if (profileExist.length > 0){
                res.json({"Status":"Profile already created"})
            }
            else if (profileExist == 0) {
                        
                const profiles = new profileModel(
                    {   
                        userId:req.body.userId,
                        firmname:req.body.firmname,
                        field:req.body.field,
                        mobileno:req.body.mobileno,
                        experience:req.body.experience,
                        location:req.body.location,
                        language:req.body.language,
                        aboutme:req.body.aboutme,
                        Status:req.body.Status,
                        profilepic:req.file.filename
                }
                )
                console.log(profiles)
                
                await profiles.save()
                res.json({"Status":"Profile Update"})

            }   
    }
    else {
        res.json({"Status":"Invalid Authentication"})
    }})  
})

app.post("/builderSignin", async(req, res)=> {
    let buildercred = req.body
    professionalModel.find({emailid:buildercred.emailid}).then(
        (datas) => {
            if (datas.length == 0) {
                res.json({"Status":"Invalid Username"})
            }
            else {
                let pwdValidator = bcrypt.compareSync(buildercred.password,datas[0].password)
                if (pwdValidator) {
                    jwt.sign({emailid:buildercred.emailid},"builderstoken",{expiresIn:"1d"},async(error, token) => {
                        if (error){
                            res.json({"Status":"Error","Error":error})
                        }
                        else {
                            let profileCreated = await profileModel.findOne({userId:datas[0]._id})
                            let field = profileCreated ? profileCreated.field : null
                            res.json({"Status":"Success","token":token,"userid":datas[0]._id,"profileCreated":!!profileCreated,"field":field})
                        }
                    })
                }
                else {
                    res.json({"Status":"Incorrect Password"})
                }
            }
        }
    )
})

app.post("/buildersSignup", async(req, res)=> {
    let details = req.body
    let hashedpwd = bcrypt.hashSync(details.password,10)
    details.password = hashedpwd
    professionalModel.find({emailid:details.emailid}).then(
        (items) => {
            if (items.length == 0) {
                let professional = new professionalModel(details)
                professional.save()
                res.json({"Status":"Success"})
            }
            else {
                res.json({"Error":"email id already exist"})
            }
        }
    )
})

app.post("/adminSignIn", async(req, res)=>{
    let admincred = req.body
    adminModel.find({}).then(
        (item) => {
            if (admincred.username != item[0].username) {
                res.json({"Status":"Invalid Username"})
            }
            else{
            let passwordValidator = bcrypt.compareSync(admincred.password,item[0].password)
            if (passwordValidator) {
                jwt.sign({username:admincred.username},"Admintoken",{expiresIn:"1d"},(error, token) => {
                    if (error) {
                        res.json({"Status":"Error", "Error":error})
                    }
                    else {
                        console.log(admincred)
                        res.json({"Status":"Success","token":token,"UserId":item[0]._id})
                    }

                    
                })}
                else{
                    res.json({"Status":"Incorrect Password"})
                }
            }
        }
                
                
            
            
        
    )
})

app.post("/adminSignUp", async(req, res) =>{
    let admindata = req.body
    let hashedPwd = bcrypt.hashSync(admindata.password,10)
    admindata.password = hashedPwd
    adminModel.find({}).then(
        (item) =>{
            if(item.length == 0) {
                let admin = new adminModel(admindata)
                admin.save()
                res.json({"Status":"Success"})
            }
            else {
                res.json({"Error":"Admin already registered"})
            }  
        }
    )
})

app.listen(8000,() =>{
    console.log("Server Started")
})