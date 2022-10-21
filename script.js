const boardHtml = document.querySelector('#Board')

const PLAYING = -1
const END_TIE = 0
const END_WIN = 2
let starterPlayer = p1

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

const Board = (() => {
	let board = [
		["", "", ""],
		["", "", ""],
		["", "", ""]
	]
	let played = 0

	const getBoard = () => {
		return board
	}

	const getPlayed = () => {
		return played
	}

	const setSquare = (i, j) => {
		if (!!document.querySelector(`#l${i}r${j}`)) {
			divSquare = document.querySelector(`#l${i}r${j}`)
			divSquare.innerHTML = board[i][j]
		} else {
			var divSquare = document.createElement('div')
			divSquare.className = "Square"
			divSquare.id = `l${i}r${j}`
			boardHtml.append(divSquare)
		}
	}

	const initHtmlBoard = () => {
		for (i = 0; i < 3; i++) {
			for (j = 0; j < 3; j++) {
				setSquare(i, j)
			}
		}
	}

	const clearBoard = () => {
		board = [
			["", "", ""],
			["", "", ""],
			["", "", ""]
		]
		console.log('CLEEEAAAAR')
		played = 0
		initHtmlBoard()
	}


	initHtmlBoard()

	const checkBox = (i, j) => {
		if (board[i][j] == "") {
			board[i][j] = GameLogic.getTurn().mark
			console.log(GameLogic.getTurn())
			played++
			GameLogic.play()
			setSquare(i, j)
			return true
		} else {
			console.log("Can't Play here")
			setSquare(i, j)
			return false
		}
	}

	document.querySelector("#Board").addEventListener('click', (event) => {
		divSquare = document.querySelector(event.path[0].id)
		i = event.path[0].id.slice(1, 2)
		j = event.path[0].id.slice(3, 4)
		checkBox(i, j)
	})

	return {
		getBoard,
		clearBoard,
		checkBox,
		getPlayed
	}
})()

const Player = (name, mark, id, bot = false) => {
	let points = 0

	return {
		points,
		name,
		mark,
		id,
		bot
	}
}

const GameLogic = (() => {

	let turn

	// Landing page to initiate the game
	document.querySelector('.overlay').classList.add('show')
	document.querySelector('.comment').innerHTML = `
	<label>Name Player 1</label>
	<input type='text' id='player1'>
	<label for='bot'>Play Against a bot</label>
	<input type='checkbox' id='bot' class='bot'>
	<label class='player2'>Name Player 2</label>
	<input type='text' id='player2' class='player2'>
	`
	document.querySelector('.continue').addEventListener('click', (event) => {
		document.querySelector('.overlay').classList.remove('show')
		p1 = Player(document.getElementById('player1').value, "O", "p1")
		if (document.getElementById('bot').checked) {
			p2 = Player("Bot", "X", "p2", bot = true)
		} else {
			p2 = Player(document.getElementById('player2').value, "X", "p2")
		}
		// Board.clearBoard()
		// setPoints()
		// Set up Players
		document.querySelector("#nameP1").innerHTML = p1.name + ` (${p1.mark})`
		document.querySelector("#nameP2").innerHTML = p2.name + ` (${p2.mark})`
		turn = p1
	})

	const setPoints = () => {
		document.querySelector("#scoreP1").innerHTML = p1.points
		document.querySelector("#scoreP2").innerHTML = p2.points
	}

	const getTurn = () => {
		return turn
	}

	const playBot = () => {
		// do {
		// 	i = getRandomInt(3)
		// 	j = getRandomInt(3)
		// } while (!Board.checkBox(i, j));
		result = minmax(Board.getBoard(), 6, turn)
		console.log(result)

		Board.checkBox(result['i'], result['j'])
	}

	const changeTurn = () => {
		if (turn == p1) {
			turn = p2
		} else {
			turn = p1
		}
		highlightPlayer()
	}

	document.querySelector('.continue').addEventListener('click', (event) => {
		document.querySelector('.overlay').classList.remove('show')
		Board.clearBoard()
		setPoints()
		if (turn == starterPlayer) changeTurn()
		starterPlayer = turn
		if (turn.bot) playBot()
	})

	const play = () => {
		mark = turn.mark
		changeTurn()
		gameState = checkState(Board.getBoard())
		if (gameState.state == PLAYING) {
		} else if (gameState.state != END_TIE) {
			document.querySelector('.overlay').classList.add('show')
			winnerMark = gameState.mark
			if (gameState.mark == p1.mark) {
				p1.points += 1
				winnerName = p1.name
			} else {
				p2.points += 1
				winnerName = p2.name
			}
			document.querySelector('.comment').innerHTML = `${winnerName} won !!`

		} else {
			console.log("It's a tie")
			document.querySelector('.overlay').classList.add('show')
			document.querySelector('.comment').innerHTML = "It's a tie !"
			p1.points += 0.5
			p2.points += 0.5
		}
		if (turn == p2 && p2.bot && gameState.state == PLAYING) {
			playBot()
		}
	}

	const highlightPlayer = () => {
		if (turn.id == "p1") {
			document.querySelector('#p1').classList.add('turn')
			document.querySelector('#p2').classList.remove('turn')
		} else {
			document.querySelector('#p2').classList.add('turn')
			document.querySelector('#p1').classList.remove('turn')
		}
	}

	return {
		play,
		getTurn
	}

})()

const countMark = (array, marks) => {
	count = marks.reduce((p, c) => ({ ...p, [c]: 0 }), {})
	array.forEach((val) => {
		marks.forEach((mark) => {
			if (mark == val) {
				count[mark] += 1
			}
		})
	})
	for (const mark in count) {
		if (count[mark] == 3) {
			return { 'state': END_WIN, mark }
		}
	}
	return { 'state': PLAYING }
}

const checkState = (board) => {
	mark = PLAYING
	for (let index = 0; index < 3; index++) {
		// Check row
		stateR = countMark(board[index], [p1.mark, p2.mark])
		// Check col
		stateC = countMark(board.map((val) => val[index]), [p1.mark, p2.mark])
		if (stateR['state'] == END_WIN) {
			mark = stateR['mark']
			break
		} else if (stateC['state'] == END_WIN) {
			mark = stateC['mark']
			break
		}
	}
	stateD1 = countMark(board.map((val, index) => val[index]), [p1.mark, p2.mark])
	stateD2 = countMark(board.map((val, index) => val[board.length - index - 1]), [p1.mark, p2.mark])
	mark = [stateD1, stateD2, stateR, stateC].filter((val, index) => val['state'] == END_WIN).map((val) => val.mark)[0]
	mark = (mark) ? mark : PLAYING
	if (mark != PLAYING) {
		return { state: END_WIN, mark }
	} else if (Board.getPlayed() == 9) {
		return { state: END_TIE }
	} else {
		return { state: PLAYING }
	}
}

// Board.emptySquares()

const getEmptySquares = (board) => {
	let empty = []
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (board[i][j] == "") {
				empty.push([i, j])
			}
		}
	}
	return empty
}

function minmax(board, depth, player) {
	let empty = getEmptySquares(board)
	let nextPlayer

	if (player == p1) {
		nextPlayer = p2
	} else {
		nextPlayer = p1
	}

	let gameState = checkState(board)
	if (gameState.state == END_WIN) {
		return (gameState.mark == 'X') ? { value: END_WIN } : { value: -END_WIN }
	}
	if (depth == 0 || empty.length == 0) {
		return { value: gameState.state }
	}

	if (player.bot) { // Maximize
		return testAllPossibilities(board, depth, player, nextPlayer, maximize = true)
		// return result
	} else { // Minimize
		return testAllPossibilities(board, depth, player, nextPlayer, maximize = false)
		// return result
	}
}

const getMax = (a, b) => {
	if (a.value > b.value) {
		return a
	}
	return b
}

const getMin = (a, b) => {
	if (a.value < b.value) {
		return a
	}
	return b
}

const testAllPossibilities = (board, depth, player, nextPlayer, maximize = true) => {
	let values = []

	// if (depth > 2) console.log("--------".repeat(depth) + " DEPTH " + depth + " OPEN Mark " + player.mark)

	getEmptySquares(board).forEach(el => {
		board[el[0]][el[1]] = player.mark
		// if (depth > 2) console.log("board mark " + player.mark + " on " + `${el[0]}, ${el[1]}`)
		// console.log(board)
		let result = minmax(board, depth - 1, nextPlayer)
		// console.log(result)
		// value = maximize ? getMax(result, value) : getMin(result, value)
		values.push({ value: result.value, i: el[0], j: el[1], proba: result.proba })
		// Reset vars
		board[el[0]][el[1]] = ""
	});

	// Compute the average score for all possibilities following a move
	const proba = values.reduce((prev, current) => prev + current.value, 0) / values.length

	// Sort possibilities by the outcome and if equal by the probability of a bad or good outcome
	// depending of who plays
	let res
	if (maximize) {
		// max to min
		res = values.sort((a, b) => b.value - a.value || b.proba - a.proba)[0]
	} else {
		// min to max
		res = values.sort((a, b) => a.value - b.value || a.proba - b.proba)[0]
	}
	res['proba'] = proba
	// if (depth > 2) console.log("--------".repeat(depth) + " DEPTH " + depth + " CLOSE ")
	// if (depth == 3) console.log(values)
	// if (depth == 3) console.log(res)
	return res
}


p1 = Player("Me", "O", "p1")
p2 = Player("Bot", "X", "p2", bot = true)

let board = [
	["X", "", "O"],
	["", "", ""],
	["", "", "O"]
]

res = minmax(board, 4, p2)
console.log(res)
console.log("test", res.i == 1 && res.j == 1)