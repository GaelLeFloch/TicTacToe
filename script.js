const boardHtml = document.querySelector('#Board')

const Board = (() => {
	let board = [
		["", "", ""],
		["", "", ""],
		["", "", ""]
	]
	let played = 0

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


	document.querySelector("#Board").addEventListener('click', (event) => {
		divSquare = document.querySelector(event.path[0].id)
		i = event.path[0].id.slice(1, 2)
		j = event.path[0].id.slice(3, 4)
		if (board[i][j] == "") {
			board[i][j] = turn.mark
			played++
		} else {
			console.log("Can't Play here")
		}
		setSquare(i, j)
		GameLogic.play()
	})

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
		played = 0
		initHtmlBoard()
	}

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
				return { 'state': 'win', mark }
			}
		}
		return { 'state': 'playing' }
	}

	const checkState = () => {
		mark = 'playing'
		for (let index = 0; index < 3; index++) {
			// Check row
			stateR = countMark(board[index], [p1.mark, p2.mark])
			// Check col
			stateC = countMark(board.map((val) => val[index]), [p1.mark, p2.mark])
			if (stateR['state'] == 'win') {
				mark = stateR['mark']
				break
			} else if (stateC['state'] == 'win') {
				mark = stateC['mark']
				break
			}
		}
		stateD1 = countMark(board.map((val, index) => val[index]), [p1.mark, p2.mark])
		stateD2 = countMark(board.map((val, index) => val[board.length - index - 1]), [p1.mark, p2.mark])
		mark = [stateD1, stateD2, stateR, stateC].filter((val, index) => val['state'] == 'win').map((val) => val.mark)[0]
		mark = (mark) ? mark : 'playing'
		if (mark != 'playing') {
			return mark
		} else if (played == 9) {
			return 'tie'
		} else {
			return 'playing'
		}
	}

	initHtmlBoard()

	return {
		board,
		checkState,
		clearBoard,
	}
})()

const Player = (name, mark, id) => {
	let points = 0

	return {
		points,
		name,
		mark,
		id
	}
}

const GameLogic = (() => {

	// Set up Players
	p1 = Player("Pedro", "O", "p1")
	document.querySelector("#nameP1").innerHTML = p1.name + ` (${p1.mark})`
	p2 = Player("Rodrigo", "X", "p2")
	document.querySelector("#nameP2").innerHTML = p2.name + ` (${p2.mark})`

	const setPoints = () => {
		document.querySelector("#scoreP1").innerHTML = p1.points
		document.querySelector("#scoreP2").innerHTML = p2.points
	}

	turn = p1

	const play = () => {
		mark = turn.mark
		if (turn == p1) {
			turn = p2
		} else {
			turn = p1
		}
		highlightPlayer()
		if (Board.checkState() == 'playing') {
		} else if (Board.checkState() != 'tie') {
			document.querySelector('.overlay').classList.add('show')
			winnerMark = Board.checkState()
			if (winnerMark == p1.mark) {
				p1.points += 1
				winnerName = p1.name
			} else {
				p2.points += 1
				winnerName = p2.name
			}
			document.querySelector('.comment').innerHTML = `${winnerName} won !!`

			document.querySelector('.continue').addEventListener('click', (event) => {
				document.querySelector('.overlay').classList.remove('show')
				Board.clearBoard()
				setPoints()
			})
		} else {
			console.log("It's a tie")
			document.querySelector('.overlay').classList.add('show')
			document.querySelector('.comment').innerHTML = "It's a tie !"
			p1.points += 0.5
			p2.points += 0.5

			document.querySelector('.continue').addEventListener('click', (event) => {
				document.querySelector('.overlay').classList.remove('show')
				Board.clearBoard()
				setPoints()
			})
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
		play
	}

})()