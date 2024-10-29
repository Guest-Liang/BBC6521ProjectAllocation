const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')

const fs = require('fs')
const yaml = require('js-yaml')
const config =  yaml.load(fs.readFileSync('../config/mysqlinfo.yaml', 'utf8'))

const app = express()
const port = 3000

// 使用 CORS 中间件
app.use(cors())

// 请求日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
    next()
})

// MySQL 数据库连接
const db = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.databasename,
})

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err)
        return
    }
    console.log('Connected to MySQL')
})

// 分配计数api
app.get('/api/allocation-count', (req, res) => {
    let query = config.database.api.allocation_count
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err)
            res.status(500).send('Error fetching data')
            return
        }
        res.json(results)
    })
})

// 分配计数api，细分BUPT和QMUL
app.get('/api/allocation-by-prefix', (req, res) => {
    let query = config.database.api.allocation_by_prefix
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err)
            res.status(500).send('Error fetching data')
            return
        }
        res.json(results)
    })
})

// 通过project_id查询分配信息api，并返回时间序列数据
app.get('/api/project-allocation', (req, res) => {
    const { project_ids } = req.query
    if (!project_ids) {
        return res.status(400).send('Project IDs are required')
    }

    const projectIdArray = project_ids.split(',')
    let placeholders = projectIdArray.map(() => '?').join(',')

    let query = config.database.api.project_allocation.replace('(?)', `(${placeholders})`)

    db.query(query, projectIdArray, (err, results) => {
        if (err) {
            console.error('Error executing query:', err)
            res.status(500).send('Error fetching data')
            return
        }

        // 数据分组
        const groupedResults = projectIdArray.reduce((acc, projectId) => {
            acc[projectId] = results
                .filter(row => row.project_id === projectId)
                .map(row => ({
                    datetime: row.datetime,
                    allocated_to: row.allocated_to
                }))
            return acc
        }, {})

        res.json(groupedResults)
    })
})

// 获取所有项目ID
app.get('/api/projects', (req, res) => {
    let query = config.database.api.projects

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err)
            res.status(500).send('Error fetching project data')
            return
        }
        res.json(results)
    })
})

// 通过student_id查询分配信息
app.get('/api/students', (req, res) => {
    const { student_ids } = req.query
    if (!student_ids) {
        return res.status(400).send('Student IDs are required')
    }

    const studentIdArray = student_ids.split(',')
    if (studentIdArray.length === 0) {
        return res.status(400).send('At least one Student ID is required')
    }

    let placeholders = studentIdArray.map(() => '?').join(',')
    let query = config.database.api.student_allocation.replace('(?)', `(${placeholders})`)

    db.query(query, studentIdArray, (err, results) => {
        if (err) {
            console.error('Error executing query:', err)
            res.status(500).send('Error fetching data')
            return
        }

        const timeSeriesData = results.map(row => ({
            project_id: row.project_id,
            datetime: row.datetime,
            allocated_to: row.allocated_to
        }))

        res.json(timeSeriesData)
    })
})

// 获取最后681条数据中的allocated_to学号
app.get('/api/students-list', (req, res) => {
    let totalQuery = config.database.api.students_list_total
    
    db.query(totalQuery, (err, result) => {
        if (err) throw err
        let totalRecords = result[0].total
        let start = totalRecords - 681
    
        let query = config.database.api.students_list
    
        db.query(query, [start], (err, results) => {
            if (err) {
                console.error('Error executing query:', err)
                res.status(500).send('Error fetching data')
                return
            }
            const studentIds = results.map(row => row.allocated_to)
            res.json(studentIds)
        })
    })
})

// 妙妙api
app.get('/api/guestliang', (req, res) => {
    const { token } = req.query;
    let query;

    if (token === config.someparams.project_data_token) {
        query = config.database.api.guestliang_project_data;
    } else if (token === config.someparams.projects_token) {
        query = config.database.api.guestliang_projects;
    } else {
        res.status(404).send('Not Found');
        return;
    }

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error fetching data');
            return;
        }
        // 压缩数据喵
        const simplifiedResults = results.map(item => {
            return {
                i: item.id,
                d: simplifyDate(item.datetime),
                p: item.project_id,
                a: item.allocated_to
            };
        });

        res.json(simplifiedResults);
    });
});

function simplifyDate(datetime) {
    const date = new Date(datetime);
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // 拼接成所需的格式，例如 "10231530"
    return `${month}${day}${hours}${minutes}`;
}


// 启动！
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
