//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {



    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin

            context.onUpdate = () => {

            }
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        this.runGame().catch(e => {
            console.log(e);
        })



    }

    private async runGame() {
        await this.loadResource()
        this.createGameScene();
        await platform.login();
        const userInfo = await platform.getUserInfo();
        console.log(userInfo);

    }

    private async loadResource() {
        try {
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig("resource/default.res.json", "resource/");
            await RES.loadGroup("preload", 0, loadingView);
            this.stage.removeChild(loadingView);
        }
        catch (e) {
            console.error(e);
        }
    }

    private textfield: egret.TextField;
    private engine: MatchvsEngine = new MatchvsEngine();
    private response: MatchvsResponse = new MatchvsResponse();
    private startButton: egret.Bitmap;
    private myTurn: boolean;

    private background: egret.Bitmap;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {
        this.response.initResponse = this.initResponse.bind(this);
        this.engine.init(this.response, "Matchvs", "alpha", 215188);

        var gameTitle = new egret.Bitmap();

        var helpText = new egret.TextField();

        this.startButton = new egret.Bitmap();
        this.startButton.texture = RES.getRes("egret_icon_png");
        this.startButton.touchEnabled = true;
        this.addChild(this.startButton);
        this.startButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onMatch, this);
    }

    private initResponse(status: number) {
        if (status === 200) {
            console.log("初始化成功!");
            this.response.registerUserResponse = this.registerUserResponse.bind(this);
            this.engine.registerUser();
        }
    }

    private registerUserResponse(userInfo: MsRegistRsp) {
        if (userInfo.status == 0) {
            console.log("注册成功");
            this.response.loginResponse = this.loginResponse.bind(this);
            this.engine.login(userInfo.userID, userInfo.token, 215188, 1, "e12affcec3a2414484f92adc0bf58e92#E", "4b132c8a77c248b5840087b0420e7faa", "v", 0);
        } else {
            console.log("注册失败", userInfo.status);
        }
    }

    private loginResponse(rsp: MsLoginRsp) {
        if (rsp.status == 200) {
            console.log("登录Matchvs联网SDK成功");
            this.response.joinRoomNotify = this.joinRoomNotify.bind(this);
            this.response.joinRoomResponse = this.joinRoomResponse.bind(this);

        }
    }

    private joinRoomResponse(status: number, roomUserInfoList: Array<MsRoomUserInfo>, roomInfo: MsRoomInfo) {
        if (status === 200) {
            // this.response.sendEventNotify = this.sendEventNotify.bind(this);

            console.log(roomUserInfoList);
            console.log("我自己进入房间成功");
            this.myTurn = false;
        }
    }

    private joinRoomNotify(roomUserInfo: MsRoomUserInfo) {
        console.log(roomUserInfo);
        // this.response.sendEventNotify = this.sendEventNotify.bind(this);
        console.log("有其他人进入房间");
        this.myTurn = true;
    }

    private sendEventNotify(eventInfo: MsSendEventNotify) {
        console.log("sendEventInfo");
        console.log(eventInfo);
        if (Number(!isNaN(Number(eventInfo.cpProto)))) {
            let clickNumber = Number(eventInfo.cpProto);
            this.sum = clickNumber;
            this.updateView();
            if (this.gameResult === "") {
                this.myTurn = true;
            }
        }
    }

    private sum = 0;
    private sumText: egret.TextField;
    private amountList = [];

    private onMatch(e) {
        this.startButton.visible = false;
        let number_grid: egret.Shape, number_amout;
        this.engine.joinRandomRoom(2, "hello matchvs");
        this.response.sendEventNotify = this.sendEventNotify.bind(this);
        for (var i = 1; i <= 81; i++) {
            number_grid = new egret.Shape();
            number_grid.graphics.beginFill(0x555555, 1);
            number_grid.graphics.drawRect((i - 1) % 9 * 50, Math.floor((i - 1) / 9) * 50, 48, 48);
            number_grid.graphics.endFill();
            number_grid.touchEnabled = true;
            number_grid.name = i.toString();
            number_grid.addEventListener(egret.TouchEvent.TOUCH_TAP, this.getNumber, this);
            this.addChild(number_grid);
            // number_amout = new egret.TextField;
            // number_amout.x = number_bitmap.x + number_bitmap.width;
            // number_amout.y = number_bitmap.y;
            // number_amout.text = "4";
            // this.amountList.push(number_amout);
            // this.addChild(number_amout);
        }
        this.sum = 0;

        this.sumText = new egret.TextField();
        this.sumText.x = 200;
        this.sumText.y = 800;
        this.sumText.text = this.sum.toString();
        this.addChild(this.sumText);
    }

    private gameResult = "";

    private updateView() {
        this.sumText.text = this.sum.toString();
        // if (this.sum > 31) {
        //     if (this.myTurn === true) {
        //         this.myTurn = false;
        //         this.gameResult = "loss";
        //         console.log("loss");
        //     } else {
        //         this.gameResult = "win";
        //         console.log("win");
        //     }
        // } else if (this.sum === 31) {
        //     if (this.myTurn === true) {
        //         this.myTurn = false;
        //         this.gameResult = "win";
        //         console.log("win");
        //     } else {
        //         this.gameResult = "loss";
        //         console.log("loss");
        //     }
        // }
    }

    private getNumber(e: egret.TouchEvent) {
        if (this.myTurn) {
            console.log(e.target.name);
            let clickNumber = Number(e.target.name);

            this.sum = clickNumber;
            this.engine.sendEvent(e.target.name);
            this.updateView();
            this.myTurn = false;

        } else {
            console.log("不是你的回合");
        }

    }

}