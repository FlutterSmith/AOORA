<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../commons/styles/style.css">
    <script type = "module" src = "index.js" ></script>
    <title>AOORACalendar</title>
</head>
<body>
    <table width = "100%" style="min-width: 1000px;">
        <tr>
            <td width="200" class="sidebar"><a href="../"><center><img src = "../commons/images/logos/AOORA-logo.svg" width="150"/></center></a></td>
            <td>More info</td>
        </tr>
        <tr>
            <td valign="top">
                <table class="sidebar" width="100%">
                    <tr>
                        <td class="focus">Dashboard</td>
                    </tr>
                    <tr>
                        <td><a href="">Detail calendar</a></td>
                    </tr>
                    <tr>
                        <td><a href="">Tickets</a></td>
                    </tr>
                    <tr>
                        <td><a href="">Devices</a></td>
                    </tr>
                    <tr>
                        <td><a href="">Alerts</a></td>
                    </tr>
                    <tr>
                        <td><a href="">Add-ons</a></td>
                    </tr>
                    <tr>
                        <td><a href="">Network discovery</a></td>
                    </tr>
                    <tr>
                        <td><a href="">Reports</a></td>
                    </tr>
                </table>
            </td>
            <td valign="top">
                <table class="dashboard" width = "100%">
                    <tr>
                        <td colspan="3"><h1>AOORACalendar Dashboard</h1></td>
                    </tr>
                    <tr>
                        <td width="33%">
                            <table class="boxcards">
                                <tr>
                                    <td class="box">3</td>
                                    <td><b>Warning alerts</b></td>
                                    <td class="box">67</td>
                                    <td><b>Critical alerts</b></td>
                                </tr>
                            </table>
                        </td>
                        <td width="33%" colspan="2">
                            <table class="boxcards">
                                <tr>
                                    <td class="box">54</td>
                                    <td><b>Open tickets</b></td>
                                    <td class="box">19</td>
                                    <td><b>Pending tickets</b></td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td width="33%">
                            <h2>Recent alerts</h2>
                            <div class = "subsection">
                                <p class = "small"><span class = "small_box">CRITICAL</span> 3 days ago</p>
                                <p><b>4 Days coding</b></p>
                                <div class = "progress_bar"><div class = "progress" style = "width: 50%"></div></div>
                            </div>
                            <div class = "subsection">
                                <p class = "small"><span class = "small_box">CRITICAL</span> 2023-07-01 3:26:33 PM</p>
                                <p><b>Papa's pizza Server 1</b></p>
                                <div class = "progress_bar"><div class = "progress" style = "width: 80%"></div></div>
                            </div>
                            <div class = "subsection">
                                <p class = "small"><span class = "small_box">WARNING</span> 2023-06-25 5:15:11 PM</p>
                                <p><b>Papa's pizza Server 1</b></p>
                                <div class = "progress_bar"><div class = "progress" style = "width: 10%"></div></div>
                            </div>
                        </td>
                        <td width="33%">
                            <h2>Ticket activity</h2>
                            <canvas id = "Ticket Graph"></canvas>
                        </td>
                        <td width="33%">
                            <h2>Patch status summary</h2>
                            <canvas id = "Patch Status Graph"></canvas>
                        </td>
                    </tr>
                    <tr>
                        <td width="33%">
                            <h2>Satisfaction</h2>
                            <p class = "box">4.6/5</p>
                            <div class = "subsection">
                                <p><b>Quality of support</b></p>
                                <div class = "progress_bar"><div class = "progress" style = "width: 92%"></div></div>
                            </div>
                            <div class = "subsection">
                                <p><b>Technician knowledge</b></p>
                                <div class = "progress_bar"><div class = "progress" style = "width: 96%"></div></div>
                            </div>
                            <div class = "subsection">
                                <p><b>Helpfulness</b></p>
                                <div class = "progress_bar"><div class = "progress" style = "width: 88%"></div></div>
                            </div>
                        </td>
                        <td width="33%">
                            <h2>Server status</h2>
                            <canvas id = "Server Status Graph"></canvas>
                        </td>
                        <td width="33%">
                            <h2>Remote devices</h2>
                            <canvas id = "Remote devices Graph"></canvas>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>