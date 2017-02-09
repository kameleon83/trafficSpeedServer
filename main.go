package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

type Trafic struct {
	Name    string
	Rx      float64
	RxName  string
	RxFinal float64
	Tx      float64
	TxName  string
	TxFinal float64
}

type Trafics struct {
	Trafics []*Trafic
}

var tt []*Trafic

func main() {

	args := os.Args
	port := ":1111"

	if args[1] == "" {
		port = ":" + args[1]
	}

	trafic := &Trafic{}
	trafic.trafic()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(tt)

	})

	log.Fatal(http.ListenAndServe(port, nil))
}

func ifConfig() ([]string, error) {
	c := exec.Command("/bin/sh", "-c", "ifconfig -s | sed \"1d\" | cut -d' ' -f1")
	b, err := c.CombinedOutput()
	if err != nil {
		logWriteFile(err)
	}
	str := byteToString(b)
	return strings.Split(str, "\n"), err
}

func logWriteFile(err error) {
	f, err := os.OpenFile("error.log", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		fc, e := os.Create("error.log")
		defer fc.Close()
		if e != nil {
			log.Println(e)
			os.Exit(1)
		}
		logWriteFile(err)
		log.Fatalf("error opening file: %v", err)
	}
	defer f.Close()

	log.SetOutput(f)
	log.Println(err)
}

func (t *Trafic) trafic() {
	go func() {

		ts := []*Trafic{}
		ip, err := ifConfig()
		var count int
		for {
			if err != nil {
				count++
				logWriteFile(err)
				if count > 100 {
					break
				}
			}
			ts2 := ts
			ts = nil
			for _, v := range ip {
				t := &Trafic{}
				readStatOk := false
				for _, val := range ts2 {

					if val.Name == v {
						t.readStat(v)

						t.Name = v

						cRx := calcDiff(val.Rx, t.Rx)
						f, s := mesure(cRx)
						t.RxFinal = f
						t.RxName = s

						cTx := calcDiff(val.Tx, t.Tx)
						f, s = mesure(cTx)
						t.TxFinal = f
						t.TxName = s

						readStatOk = true
					}

				}
				if !readStatOk {
					t.readStat(v)
				}
				ts = append(ts, t)
			}
			tt = ts
			time.Sleep(time.Second)
		}
	}()
}

func (t *Trafic) readStat(crtReseau string) *Trafic {
	for {
		argTx := "/sys/class/net/" + crtReseau + "/statistics/tx_bytes"
		argRx := "/sys/class/net/" + crtReseau + "/statistics/rx_bytes"

		rx, errRx := ioutil.ReadFile(argRx)
		tx, errTx := ioutil.ReadFile(argTx)

		if errRx != nil {
			logWriteFile(errRx)
		}
		if errTx != nil {
			logWriteFile(errTx)
		}

		t.Name = crtReseau
		t.Rx = byteToFloat(rx)
		t.Tx = byteToFloat(tx)
		return t
	}
}

func calcDiff(a, b float64) float64 {
	return b - a
}

func byteToString(b []byte) string {
	return strings.TrimSpace(string(b))
}

func byteToFloat(b []byte) float64 {
	f, err := strconv.ParseFloat(byteToString(b), 32)
	if err != nil {
		logWriteFile(err)
	}
	return f
}

func mesure(f float64) (float64, string) {
	// f := float64(i)
	koctet := math.Exp2(10)
	moctet := math.Exp2(20)
	goctet := math.Exp2(30)
	if f > goctet {
		return float64WithPrecision(f, 3) / goctet, "Go/s"
	} else if f > moctet {
		return float64WithPrecision(f, 3) / moctet, "Mo/s"
	} else if f > koctet {
		return float64WithPrecision(f, 3) / koctet, "Ko/s"
	}
	return float64WithPrecision(f, 0), "o/s"
}

func float64WithPrecision(f float64, n int) float64 {
	var round float64
	pow := math.Pow(10, float64(n))
	digit := pow * f
	round = math.Ceil(digit)
	return round / pow
}
