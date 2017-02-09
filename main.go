// Copyright 2017 Samuel Michaux. All rights reserved.
// license that can be found in the LICENSE file.

// Package main
package main

import (
	"encoding/json"
	"errors"
	"flag"
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

// Trafic est une structure regroupant les éléments nécessaires pour récupérer le trafic réseau
type Trafic struct {
	Name    string
	RxFinal float64
	Rx      float64
	RxName  string
	TxFinal float64
	Tx      float64
	TxName  string
}

var tt []*Trafic

func main() {

	var port int
	flag.IntVar(&port, "port", 1111, "Choix du port")
	var timer int
	flag.IntVar(&timer, "timer", 1, "Choix du port")

	flag.Parse()

	trafic := &Trafic{}
	trafic.trafic(time.Duration(int(timer)))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(tt)

	})
	logWriteFile(errors.New("Démarrage de l'application Ok - port : " + strconv.Itoa(port)))
	logWriteFile(http.ListenAndServe(":"+strconv.Itoa(port), nil))
}

// ifConfig va récupérer les nom de chaque carte réseaux
func ifConfig() ([]string, error) {
	c := exec.Command("/bin/sh", "-c", "ifconfig -s | sed \"1d\" | cut -d' ' -f1")
	b, err := c.CombinedOutput()
	if err != nil {
		logWriteFile(err)
	}
	str := byteToString(b)
	return strings.Split(str, "\n"), err
}

// logWriteFile va écrire les log dans un fichier trafficSp.log
func logWriteFile(er error) {
	f, err := os.OpenFile("logfile.log", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		fc, e := os.Create("logfile.log")
		defer fc.Close()
		if e != nil {
			log.Fatalf("error create file: %v", e)
			os.Exit(1)
		}
		logWriteFile(err)
		log.Fatalf("error opening file: %v", err)
	}
	defer f.Close()

	log.SetOutput(f)
	log.Println(er)
}

// Trafic va calculer le béit de chaque carte réseaux
func (t *Trafic) trafic(dur time.Duration) {
	go func() {

		ts := []*Trafic{}
		ip, err := ifConfig()
		var count int
		for {
			log.Println("time")
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
			time.Sleep(time.Second * dur)
		}
	}()
}

// ReadStat va chercher dans le système les statistics en byte du réseau demandé
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

// CalcDiff va calculer la différence entre les statistics avant et après suivant un timer donné dans le main
func calcDiff(a, b float64) float64 {
	return b - a
}

// ByteToString va transformer des bytes en chaînes de caractères
func byteToString(b []byte) string {
	return strings.TrimSpace(string(b))
}

// ByteToFloat va transformer des bytes en décimal
func byteToFloat(b []byte) float64 {
	f, err := strconv.ParseFloat(byteToString(b), 32)
	if err != nil {
		logWriteFile(err)
	}
	return f
}

// Mesure permet de transformer les bits en octets
func mesure(f float64) (float64, string) {
	// f := float64(i)
	koctet := math.Exp2(10)
	moctet := math.Exp2(20)
	goctet := math.Exp2(30)
	if f > goctet {
		return float64WithPrecision(f/goctet, 3), "Go/s"
	} else if f > moctet {
		return float64WithPrecision(f/moctet, 3), "Mo/s"
	} else if f > koctet {
		return float64WithPrecision(f/koctet, 3), "Ko/s"
	}
	return float64WithPrecision(f, 0), "o/s"
}

// float64WithPrecision va permettre de choisir le nombre de chiffres après la virgule
func float64WithPrecision(f float64, n int) float64 {
	var round float64
	pow := math.Pow(10, float64(n))
	digit := pow * f
	round = math.Ceil(digit)
	return round / pow
}
