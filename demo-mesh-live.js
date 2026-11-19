import { swarmMesh } from './src/swarm-mesh.js';

async function runMeshDemo() {
  console.log('🌐 [Live Swarm Mesh Demo]: Initializing decentralized multi-terminal peer communication...');

  const reg1 = swarmMesh.registerNode();
  console.log('🟢 Terminal Node A registered in mesh registry:', reg1);

  const peers = swarmMesh.discoverPeers();
  console.log('📡 Discovered Sibling Terminal Peers:', peers);

  console.log('💬 Dispatching cross-node task from Master Terminal -> Calculator Terminal...');
  const response = await swarmMesh.sendPeerMessage(32091, {
    action: 'CALCULATE',
    expression: '0.1 + 0.2'
  });

  console.log('🎯 Cross-Node Message Acknowledgement Received:', response);
  console.log('🎉 Decentralized Multi-Terminal Swarm Mesh Communication Successful!');
}

runMeshDemo();
