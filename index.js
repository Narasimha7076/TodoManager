import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "todo",
    password: "Webdev@123",
    port: 5432,
  });

db.connect();  
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

var today = new Date();

var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();

var formattedDate = dd + '/' + mm + '/' + yyyy;

app.get("/", async (req,res) => {
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    let items = [];
    items = result.rows;
    res.render("index.ejs", {
        listItems: items,
        placeholder: "Add New ..",
        editRow: ""
    });
});

app.post("/add", async(req,res) => {
    console.log(req.body);
    const title = req.body.updatedtitle;
    const due = req.body.duedate;
    const id = req.body.itemId;
    if(title && id < 0){
        await db.query("INSERT INTO items (title,due,created) VALUES ($1,$2,$3)",[title,due,formattedDate]);
        res.redirect("/");
    }
    else if(title && id) {
        await db.query("UPDATE items SET title = $1,due = $2 WHERE id = $3",[title,due,id] );
        res.redirect("/");
    }
    else {
        const result = await db.query("SELECT * FROM items ORDER BY id ASC");
        let items = [];
        items = result.rows;
        res.render("index.ejs",{
            listItems: items,
            placeholder: "Title is required ..",
            editRow: ""
        });
    }
   
});

app.post("/filter", async(req,res) => {
    console.log(req.body);
    let filter = req.body.filter;
    switch(filter) {
        case 'all':
            const allResult = await db.query("SELECT * FROM items");
            let allItems = allResult.rows;
            res.render("index.ejs", {
                listItems: allItems,
                placeholder: "Add New ..",
                editRow: ""
            });
            break;
        case 'completed':
            const comp = await db.query("SELECT * FROM items WHERE status = 'complete'");
            let completed = comp.rows;
            
            res.render("index.ejs", {
                listItems: completed,
                placeholder: "Add New ..",
                editRow: ""
            });
            break;
        case 'active':
            const act = await db.query("SELECT * FROM items WHERE status IS NULL");
            let active = act.rows;
            console.log(active);
            res.render("index.ejs", {
                listItems: active,
                placeholder: "Add New ..",
                editRow: ""
            });
            break;
        case 'has-due-date':
            const dueDateResult = await db.query("SELECT * FROM items WHERE due <> ''");
            let dueDateItems = dueDateResult.rows;
            res.render("index.ejs", {
                listItems: dueDateItems,
                placeholder: "Add New ..",
                editRow: ""
            });
            break;
            
        default:
            break;
    };
    
});

app.post("/sort", async(req,res) => {
    console.log(req.body);
    let sort = req.body.sort;
    switch(sort) {
        case 'added-date-asc':
            const allResultAsc = await db.query("SELECT * FROM items ORDER BY created ASC");
            let allItemsAsc = allResultAsc.rows;
            res.render("index.ejs", {
                listItems: allItemsAsc,
                placeholder: "Add New ..",
                editRow: ""
            });
            break;
        case 'due-date-desc':
            const dueDateResultDesc = await db.query("SELECT * FROM items WHERE due IS NOT NULL ORDER BY due DESC");
            let dueDateItemsDesc = dueDateResultDesc.rows;
            res.render("index.ejs", {
                listItems: dueDateItemsDesc,
                placeholder: "Add New ..",
                editRow: ""
            });
            break;
        default:
            break;
    }; 
});

app.post("/complete", async(req,res) => {
    console.log(req.body);
    const id = req.body.itemId;
    await db.query("UPDATE items SET status = 'complete' WHERE id = $1",[id]);
    res.redirect("/");
});

app.post("/edit", async(req,res) => {
    console.log(req.body);
    const id = req.body.itemId;
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    let items = [];
    items = result.rows;
    const editRowResult = await db.query("SELECT * FROM items WHERE id = $1",[id]);
    const editRow = editRowResult.rows[0];
    res.render("index.ejs",{
        listItems: items,
        placeholder: " ",
        editRow: editRow
    });
    
});   

app.post("/delete", async(req,res) => {
    console.log(req.body);
    const id = req.body.itemId;
    await db.query("DELETE FROM items WHERE id = $1",[id]);
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server is ruunig on port ${port}`);
});