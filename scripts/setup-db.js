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
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        transaction_id VARCHAR(255) NOT NULL UNIQUE,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        amount_cents INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

        // A buyer may make more than one payment; each transaction needs its own row.
        await pool.query(`ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_email_key`)
        await pool.query(`CREATE INDEX IF NOT EXISTS customers_email_idx ON customers (email)`)

        await pool.query(`
          CREATE TABLE IF NOT EXISTS customer_access_grants (
            email VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255),
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `)

        await pool.query(`
          CREATE TABLE IF NOT EXISTS model_profiles (
            id SERIAL PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            slug VARCHAR(80) NOT NULL UNIQUE,
            handle VARCHAR(120) NOT NULL DEFAULT '',
            cover_image TEXT NOT NULL,
            photo_count INTEGER NOT NULL DEFAULT 0,
            video_count INTEGER NOT NULL DEFAULT 0,
            bio TEXT NOT NULL DEFAULT '',
            media JSONB NOT NULL DEFAULT '[]'::jsonb,
            is_published BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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
