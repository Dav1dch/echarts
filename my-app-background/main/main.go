package main

import (
	"log"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/360EntSecGroup-Skylar/excelize/v2"
)

var file *excelize.File
var idIndex map[string]int

func main() {
	r := gin.Default()
	file, _ = excelize.OpenFile("../test.xlsx")
	cols, _ := file.GetCols("测试数据")
	idCol := cols[1][1:]
	idIndex = make(map[string]int)

	for index, id := range idCol {
		idIndex[id] = index
	}

	r.GET("/gender", func(c *gin.Context) {
		male, female := getGender()
		log.Println(male)
		log.Println(female)
		c.JSON(200, gin.H{
			"male":   male,
			"female": female,
		})
	})

	r.GET("/allStudent", func(c *gin.Context) {
		res := getAllStudent()
		log.Println(res)
		c.JSON(200, gin.H{
			"yuwen_1": res[0],
			"yuwen_2": res[1],
			"yuwen_3": res[2],
			"yuwen_4": res[3],
			"sum":     res[4],
		})
	})
	r.GET("/single/:id", func(c *gin.Context) {
		id := c.Param("id")
		res := getSingle(id)
		if res == nil {
			c.JSON(200, gin.H{
				"info": "not found",
			})

		} else {

			c.JSON(200, gin.H{
				"yuwen_1": res[0],
				"yuwen_2": res[1],
				"yuwen_3": res[2],
				"yuwen_4": res[3],
				"sum":     res[4],
			})
		}
	})
	r.Run()

}

func getGender() (int, int) {
	cols, _ := file.GetCols("测试数据")
	genderCol := cols[2][1:]
	male := 0
	for _, gender := range genderCol {
		if gender == "1" {
			male++
		}
	}
	return male, len(genderCol) - male
}

func getAllStudent() []float64 {
	cols, _ := file.GetCols("测试数据")
	var res []float64
	var average float64
	for i := 8; i < 12; i++ {
		tempCol := cols[i][1:]
		var tempRes float64
		for _, cell := range tempCol {
			temp, err := strconv.ParseFloat(cell, 64)
			if err != nil {
				tempRes += 0
			} else {
				tempRes += temp
			}
		}
		tempRes /= float64(len(tempCol))
		average += tempRes
		res = append(res, tempRes)
	}
	res = append(res, average)
	return res
}

func getSingle(id string) []float64 {
	index, ok := idIndex[id]
	if ok {
		rows, _ := file.GetRows("测试数据")
		row := rows[index+1]
		var res []float64
		var average float64
		for i := 8; i < 12; i++ {
			cell := row[i]
			var tempRes float64
			temp, err := strconv.ParseFloat(cell, 64)
			if err != nil {
				tempRes = float64(0)
			} else {
				tempRes = temp
			}
			average += tempRes
			res = append(res, tempRes)
		}
		res = append(res, average)
		return res

	} else {
		return nil
	}

}
