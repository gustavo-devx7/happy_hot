#!/usr/bin/env node
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

function loadEnv() {
    const envPath = ['.env.local', '.env']
        .map(fileName => path.join(__dirname, '..', fileName))
        .find(filePath => fs.existsSync(filePath))

    if (!envPath) {
        throw new Error('Arquivo .env.local ou .env não encontrado')
    }

    const envContent = fs.readFileSync(envPath, 'utf-8')
    const env = {}
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=')
        if (key && valueParts.length) {
            env[key.trim()] = valueParts.join('=').trim()
        }
    })
    return env
}

async function setupDatabase() {
    const env = loadEnv()
    const neonUrl = env.NEON_URL

    if (!neonUrl) {
        console.error('❌ NEON_URL não configurada em .env.local ou .env')
        process.exit(1)
    }

    const pool = new Pool({ connectionString: neonUrl })

    try {
        console.log('📊 Criando tabela de clientes...')

        await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        transaction_id VARCHAR(255) NOT NULL UNIQUE,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        amount_cents INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

        console.log('✅ Tabela customers criada com sucesso!')
    } catch (error) {
        if (error.code === '42P07') {
            console.log('✅ Tabela customers já existe')
        } else {
            console.error('❌ Erro ao criar tabela:')
            console.error('Mensagem:', error.message)
            process.exit(1)
        }
    } finally {
        await pool.end()
    }
}

setupDatabase()
