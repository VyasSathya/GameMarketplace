#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting GameMarketplace development environment...\n');

// Check if Nigiri is available for Bitcoin testnet
function checkNigiri() {
  return new Promise((resolve) => {
    const nigiri = spawn('nigiri', ['--version'], { stdio: 'pipe' });
    nigiri.on('close', (code) => {
      resolve(code === 0);
    });
    nigiri.on('error', () => {
      resolve(false);
    });
  });
}

async function startDevelopment() {
  const hasNigiri = await checkNigiri();
  
  if (!hasNigiri) {
    console.log('⚠️  Nigiri not found. Install it for Bitcoin testnet support:');
    console.log('   curl https://getnigiri.vulpem.com | bash\n');
  } else {
    console.log('✅ Nigiri detected - Bitcoin testnet available');
    console.log('   Run: pnpm bitcoin:testnet (to start Bitcoin regtest)');
    console.log('   Run: pnpm bitcoin:faucet <address> (to get test coins)\n');
  }

  // Start all development services
  const services = [
    {
      name: 'Shared (Types)',
      command: 'pnpm',
      args: ['--filter', 'shared', 'run', 'dev'],
      color: '\x1b[36m' // Cyan
    },
    {
      name: 'Bitcoin Package',
      command: 'pnpm',
      args: ['--filter', 'bitcoin', 'run', 'dev'],
      color: '\x1b[33m' // Yellow
    },
    {
      name: 'Backend API',
      command: 'pnpm',
      args: ['--filter', 'backend', 'run', 'dev'],
      color: '\x1b[32m' // Green
    },
    {
      name: 'Frontend Web',
      command: 'pnpm',
      args: ['--filter', 'web', 'run', 'dev'],
      color: '\x1b[35m' // Magenta
    }
  ];

  services.forEach((service, index) => {
    setTimeout(() => {
      console.log(`${service.color}[${service.name}]\x1b[0m Starting...`);
      
      const proc = spawn(service.command, service.args, {
        stdio: 'inherit',
        shell: true,
        cwd: path.resolve(__dirname, '..')
      });

      proc.on('error', (err) => {
        console.error(`${service.color}[${service.name}]\x1b[0m Error:`, err.message);
      });

    }, index * 2000); // Stagger startup by 2 seconds
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development environment...');
    process.exit(0);
  });
}

startDevelopment().catch(console.error);
