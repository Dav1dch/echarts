import { Input, Button } from "antd";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./App.css";
import { Component } from "react";
import ajax from "./utils/ajaxUtil";

var echarts = require("echarts");
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      info: "",
      data: [],
      studentId: "",
      average: [],
      single: [],
    };
  }
  componentDidMount() {
    var genderRes = ajax("/api/gender", {}, "GET");
    var studentRes = ajax("/api/allStudent", {}, "GET");
    genderRes.then((value) => {
      this.setState({
        data: value.data,
      });
      var ec = echarts.init(document.getElementById("echarts"));
      ec.setOption({
        legend: {
          top: "bottom",
        },
        toolbox: {
          // show: true,
          // feature: {
          //   mark: { show: true },
          //   dataView: { show: true, readOnly: false },
          //   restore: { show: true },
          //   saveAsImage: { show: true },
          // },
        },
        series: [
          {
            name: "面积模式",
            type: "pie",
            radius: [50, 250],
            center: ["50%", "50%"],
            roseType: "area",
            itemStyle: {
              borderRadius: 8,
            },
            label: {
              normal: {
                show: true,
                formatter: function (v) {
                  var val = v.data.value;
                  return val;
                },

                color: "#000",
              },
            },
            data: [
              { value: this.state.data.male, name: "male" },
              { value: this.state.data.female, name: "female" },
            ],
          },
        ],
      });
    });
    studentRes.then((value) => {
      this.setState({
        average: value.data,
      });
      var allec = echarts.init(document.getElementById("allStudentEcharts"));
      allec.setOption({
        title: {
          text: "语文成绩",
          subtext: "数据来自xlsx",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        legend: {
          data: ["总体", "个人"],
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
          boundaryGap: [0, 0.01],
        },
        yAxis: {
          type: "category",
          data: ["yuwen_4", "yuwen_3", "yuwen_2", "yuwen_1", "总分"],
        },
        series: [
          {
            name: "总体",
            type: "bar",
            data: [
              this.state.average.yuwen_4,
              this.state.average.yuwen_3,
              this.state.average.yuwen_2,
              this.state.average.yuwen_1,
              this.state.average.sum,
            ],
          },
          {
            name: "个人",
            type: "bar",
            data: [
              this.state.single.yuwen_4,
              this.state.single.yuwen_3,
              this.state.single.yuwen2,
              this.state.single.yuwen_1,
              this.state.single.sum,
            ],
          },
        ],
      });
    });
  }

  onSub = (value) => {
    var singleRes = ajax("/api/single/" + this.state.studentId, {}, "GET");
    singleRes.then((value) => {
      if (value.data.info === "not found") {
        console.log("not found");
        this.setState({
          info: "student not found",
        });
      } else {
        this.setState({
          single: value.data,
          info: "",
        });
        var allec = echarts.init(document.getElementById("allStudentEcharts"));
        allec.setOption({
          title: {
            text: "语文成绩",
            subtext: "数据来自xlsx",
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
          },
          legend: {
            data: ["总体", "个人"],
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            containLabel: true,
          },
          xAxis: {
            type: "value",
            boundaryGap: [0, 0.01],
          },
          yAxis: {
            type: "category",
            data: ["yuwen_4", "yuwen_3", "yuwen_2", "yuwen_1", "总分"],
          },
          series: [
            {
              name: "总体",
              type: "bar",
              data: [
                this.state.average.yuwen_4,
                this.state.average.yuwen_3,
                this.state.average.yuwen_2,
                this.state.average.yuwen_1,
                this.state.average.sum,
              ],
            },
            {
              name: "个人",
              type: "bar",
              data: [
                this.state.single.yuwen_4,
                this.state.single.yuwen_3,
                this.state.single.yuwen2,
                this.state.single.yuwen_1,
                this.state.single.sum,
              ],
            },
          ],
        });
      }
    });
  };

  onInput = (value) => {
    this.setState({
      studentId: value.target.value,
    });
  };

  onPdf = () => {
    const input = document.getElementById("charts");

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "px", "a4");
      var pdfWidth = pdf.internal.pageSize.getWidth();
      var pdfHeight = pdf.internal.pageSize.getHeight();

      var imgWidth = pdfWidth - 10;
      var imgHeight = (imgWidth * canvas.height) / canvas.width;
      var startX = 10 / 2;
      var startY = (pdfHeight - imgHeight) / 2;
      console.log(imgWidth);
      console.log(imgHeight);
      console.log(startX);
      console.log(startY);

      pdf.addImage(imgData, "PNG", startX, startY, imgWidth, imgHeight);
      // pdf.addImage(imgData, "JPEG", 0, 0, 200, (200 * height) / width);
      pdf.save("test.pdf");
    });
  };

  render() {
    return (
      <div className="App">
        <Input
          onChange={this.onInput}
          id="studentId"
          value={this.state.studentId}
          placeholder="请输入学号"
        ></Input>
        <Button type="primary" className="subButton" onClick={this.onSub}>
          查找
        </Button>
        <Button type="primary" className="subButton" onClick={this.onPdf}>
          Download Pdf
        </Button>
        <div>{this.state.info}</div>
        <div id="charts">
          <div style={{ fontSize: "50px" }}>报告结果</div>
          <div id="echarts" style={{ width: "100%", height: 600 }}></div>
          <div
            id="allStudentEcharts"
            style={{ width: "100%", height: 600 }}
          ></div>
        </div>
      </div>
    );
  }
}
// function App() {
//   return (
//     <div className="App">
//       <div id="echarts"></div>
//       {/* <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header> */}
//     </div>
//   );
// }

export default App;
