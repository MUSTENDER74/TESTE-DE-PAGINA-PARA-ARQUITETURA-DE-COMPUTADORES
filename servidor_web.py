from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

estado_maquina = {
    "total": 0,
    "contagem": {
        "Vermelho": 0, "Azul": 0, "Verde": 0, "Amarelo": 0,
        "Preto": 0, "Branco": 0, "Laranja": 0, "Roxo": 0
    }
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/status')
def status():
    return jsonify(estado_maquina)

@app.route('/registrar_peca', methods=['POST'])
def registrar_peca():
    cor = request.get_json().get('cor')
    if cor in estado_maquina["contagem"]:
        estado_maquina["contagem"][cor] += 1
        estado_maquina["total"] += 1
    return jsonify({"status": "ok"})

@app.route('/esvaziar', methods=['POST'])
def esvaziar():
    cor = request.get_json().get('cor')
    if cor in estado_maquina["contagem"]:
        estado_maquina["total"] -= estado_maquina["contagem"][cor]
        estado_maquina["contagem"][cor] = 0
    return jsonify({"status": "ok"})

@app.route('/esvaziar_tudo', methods=['POST'])
def esvaziar_tudo():
    estado_maquina["total"] = 0
    for cor in estado_maquina["contagem"]:
        estado_maquina["contagem"][cor] = 0
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)