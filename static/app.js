const MAX_CAPACITY = 20;
const bins = [
    { id: 1, name: "Vermelho", bgStyle: "bg-red-500", count: 0 },
    { id: 2, name: "Azul", bgStyle: "bg-blue-500", count: 0 },
    { id: 3, name: "Verde", bgStyle: "bg-green-500", count: 0 },
    { id: 4, name: "Amarelo", bgStyle: "bg-yellow-500", count: 0 },
    { id: 5, name: "Preto", bgStyle: "bg-gray-700", count: 0 },
    { id: 6, name: "Branco", bgStyle: "bg-gray-200", count: 0 },
    { id: 7, name: "Laranja", bgStyle: "bg-orange-500", count: 0 },
    { id: 8, name: "Roxo", bgStyle: "bg-purple-500", count: 0 },
];

let totalFilaments = 0;

const tabDashboard = document.getElementById('tab-dashboard');
const tabLogs = document.getElementById('tab-logs');
const viewDashboard = document.getElementById('view-dashboard');
const viewLogs = document.getElementById('view-logs');
const terminalOutput = document.getElementById('terminal-output');
const binsContainer = document.getElementById('bins-container');
const totalCountEl = document.getElementById('total-count');
const statusCamEl = document.getElementById('status-camera');
const iconCamEl = document.getElementById('icon-camera');
const iconBgCamEl = document.getElementById('icon-bg-camera');

function getBadgeHTML(count) {
    if (count > MAX_CAPACITY) return `<span class="text-[10px] font-bold px-2 py-0.5 rounded border border-purple-800 bg-purple-900/50 text-purple-400 pulse">TRANSBORDANDO</span>`;
    if (count === MAX_CAPACITY) return `<span class="text-[10px] font-bold px-2 py-0.5 rounded border border-red-800 bg-red-900/50 text-red-400">CHEIO</span>`;
    if (count >= 15) return `<span class="text-[10px] font-bold px-2 py-0.5 rounded border border-orange-800 bg-orange-900/50 text-orange-400">LIMITE PRÓXIMO</span>`;
    return `<span class="text-[10px] font-bold px-2 py-0.5 rounded border border-green-800 bg-green-900/50 text-green-400">NORMAL</span>`;
}

function updateBinUI(bin) {
    document.getElementById(`count-text-${bin.id}`).innerHTML = `${bin.count} <span class="text-sm text-gray-500">/ ${MAX_CAPACITY}</span>`;
    const percent = Math.min((bin.count / MAX_CAPACITY) * 100, 100);
    document.getElementById(`progress-${bin.id}`).style.width = `${percent}%`;
    document.getElementById(`badge-${bin.id}`).innerHTML = getBadgeHTML(bin.count);
}

window.emptyBin = async function(id) {
    const bin = bins.find(b => b.id === id);
    if (bin) {
        await fetch('/esvaziar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cor: bin.name })
        });
        addLog(`AVISO: Compartimento ${bin.name} esvaziado manualmente.`, "text-orange-400 font-bold");
        buscarDadosReais(); 
    }
};

window.emptyAllBins = async function() {
    if (totalFilaments === 0) return;
    await fetch('/esvaziar_tudo', { method: 'POST' });
    addLog("ALERTA CRÍTICO: TODOS os compartimentos foram esvaziados.", "text-red-500 font-bold bg-red-900/20 inline-block px-1 rounded");
    buscarDadosReais(); 
};

function renderBins() {
    binsContainer.innerHTML = '';
    bins.forEach(bin => {
        const percent = Math.min((bin.count / MAX_CAPACITY) * 100, 100);
        const badge = getBadgeHTML(bin.count);
        
        const binHTML = `
            <div class="bg-gray-900 border border-gray-800 p-4 rounded-xl flex flex-col shadow-sm relative overflow-hidden transition-all duration-300" id="bin-${bin.id}">
                <div class="flex items-center justify-between mb-3 relative z-10">
                    <div class="flex items-center gap-2">
                        <div class="w-3.5 h-3.5 rounded-full shadow-sm ${bin.bgStyle} border border-gray-700"></div>
                        <span class="text-sm font-semibold text-gray-300">${bin.name}</span>
                    </div>
                    <div id="badge-${bin.id}">${badge}</div>
                </div>
                
                <div class="flex justify-between items-end mb-2 relative z-10">
                    <span class="text-xs text-gray-500 font-medium">Capacidade</span>
                    <span class="text-lg font-bold text-white font-mono" id="count-text-${bin.id}">${bin.count} <span class="text-sm text-gray-500">/ ${MAX_CAPACITY}</span></span>
                </div>
                
                <div class="w-full bg-gray-800 rounded-full h-2 mb-4 relative z-10 overflow-hidden shadow-inner">
                    <div class="h-full rounded-full ${bin.bgStyle} transition-all duration-500 ease-out" style="width: ${percent}%" id="progress-${bin.id}"></div>
                </div>

                <button onclick="emptyBin(${bin.id})" class="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white py-2 rounded-lg text-xs font-medium transition-colors border border-gray-700 flex items-center justify-center gap-2 z-10 relative">
                    <i class="fa-solid fa-trash-can"></i> Esvaziar
                </button>
                
                <div id="flash-${bin.id}" class="absolute inset-0 ${bin.bgStyle} opacity-0 transition-opacity duration-300 pointer-events-none"></div>
            </div>
        `;
        binsContainer.insertAdjacentHTML('beforeend', binHTML);
    });
}
renderBins();

tabDashboard.addEventListener('click', () => {
    viewDashboard.classList.remove('hidden');
    viewLogs.classList.add('hidden'); viewLogs.classList.remove('flex');
    tabDashboard.className = "flex-1 py-3 text-center border-b-2 border-blue-500 text-blue-400 font-medium transition-colors";
    tabLogs.className = "flex-1 py-3 text-center border-b-2 border-transparent text-gray-500 hover:text-gray-300 font-medium transition-colors";
});

tabLogs.addEventListener('click', () => {
    viewDashboard.classList.add('hidden');
    viewLogs.classList.remove('hidden'); viewLogs.classList.add('flex');
    tabLogs.className = "flex-1 py-3 text-center border-b-2 border-blue-500 text-blue-400 font-medium transition-colors";
    tabDashboard.className = "flex-1 py-3 text-center border-b-2 border-transparent text-gray-500 hover:text-gray-300 font-medium transition-colors";
});

function addLog(message, colorClass = "text-gray-300") {
    const timeString = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const logEntry = document.createElement('div');
    logEntry.innerHTML = `<span class="text-gray-600 mr-2">[${timeString}]</span> <span class="${colorClass}">${message}</span>`;
    terminalOutput.appendChild(logEntry);
    terminalOutput.scrollTop = terminalOutput.scrollHeight; 
}

addLog("Conexão estabelecida com o Hardware...", "text-blue-400");
addLog("Aguardando leitura real da máquina...", "text-green-500");

async function buscarDadosReais() {
    try {
        const resposta = await fetch('/status');
        const dados = await resposta.json();

        if (dados.total !== totalFilaments) {
            totalFilaments = dados.total;
            totalCountEl.innerText = `Total: ${totalFilaments}`;
        }

        for (const [cor, quantidade] of Object.entries(dados.contagem)) {
            let bin = bins.find(b => b.name === cor);
            
            if (bin && bin.count !== quantidade) {
                if (quantidade > bin.count) {
                    addLog(`Filamento ${bin.name} processado pela máquina.`, "text-gray-400");
                    
                    statusCamEl.innerText = bin.name.toUpperCase();
                    statusCamEl.className = "text-xl font-bold text-white tracking-wide";
                    iconCamEl.className = "fa-solid fa-camera text-xl text-white pulse";
                    iconBgCamEl.className = `w-12 h-12 rounded-full ${bin.bgStyle} flex items-center justify-center border border-gray-700 transition-colors duration-300`;
                    
                    const flashEl = document.getElementById(`flash-${bin.id}`);
                    if(flashEl) {
                        flashEl.classList.remove('opacity-0');
                        flashEl.classList.add('opacity-30');
                        setTimeout(() => {
                            flashEl.classList.remove('opacity-30');
                            flashEl.classList.add('opacity-0');
                        }, 400);
                    }

                    setTimeout(() => {
                        statusCamEl.innerText = "AGUARDANDO";
                        statusCamEl.className = "text-xl font-bold text-gray-500 tracking-wide uppercase";
                        iconCamEl.className = "fa-solid fa-camera text-xl text-gray-400";
                        iconBgCamEl.className = "w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 transition-colors duration-300";
                    }, 1000);
                }
                bin.count = quantidade;
                updateBinUI(bin);
            }
        }
    } catch (erro) {
        console.error("Falha ao comunicar com o servidor", erro);
    }
}
setInterval(buscarDadosReais, 1000);