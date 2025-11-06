import express from 'express'
import sql from 'mssql'
import 'dotenv/config'

const router = express.Router();

const dbConnectionString = process.env.DB_CONNECTION_STRING;

router.get('/', async (req, res) => {

    await sql.connect(dbConnectionString);

    const result = await sql.query`SELECT a.OccasionId, a.Title, a.Description, a.Filename, a.CreatedAt, b.CategoryId, b.Name from [dbo].[Occasion] a INNER JOIN [dbo].[Category] b ON a.CategoryId = b.CategoryId ORDER BY a.[CreatedAt] DESC`;
    
    console.dir(result);
    res.json(result.recordset);
})

router.get('/:id', async (req,res) => {
    const id = req.params.id;

    await sql.connect(dbConnectionString);
    const result = await sql.query`SELECT a.OccasionId, a.Title, a.Description, a.Filename, a.CreatedAt, b.CategoryId, b.Name from [dbo].[Occasion] a INNER JOIN [dbo].[Category] b ON a.CategoryId = b.CategoryId WHERE a.OccasionId = ${id}`;
    
    console.dir(result);
    res.json(result.recordset);
    
})

export default router;