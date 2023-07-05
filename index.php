<?php

class ElenaSystem{
    public $name;
    public function __construct(){
        $this->name = "Elena";
    }

    public function generateTitle(){
        
    }
}

?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="commons/styles/style.css">
    <title>AOORA</title>
</head>

<body>
    <table class="section" width="940">
        <tr>
            <td width="50"><img src="commons/images/logos/AOORA-logo.svg" alt="AOORA-logo" height="59" /></td>
            <td>&nbsp;</td>
            <td width="75"><a>Features</a></td>
            <td width="55"><a>Pricing</a></td>
            <td width="200">
                <form action="AOORALogin/"><button class="neo">Mi cuenta AOORA</button></form>
            </td>
        </tr>
    </table>
    <table class="section" width="940">
        <tr width="940">
            <td colspan="2">
                <h1 class="main-title">Buenos d&iacute;as, Elena!</h1>
            </td>
        </tr>
        <tr>
            <td>
                <input type="text" placeholder="Escribe tu entrada aquí..." class="neo" />
            </td>
            <td width="150">
                <button class="neo">Cercar</button>
            </td>
        </tr>
    </table>
    <table class="section icons" width="600">
        <tr>
            <td width="60"><a href="Temp/">
                    <img src="commons/images/icons/contacts.png" alt="Contacts" width="60">
                    <p>Contactos</p>
                </a></td>
            <td width="60"><a href="AOORACalendar/">
                    <img src="commons/images/icons/calendar.png" alt="Contacts" width="60">
                    <p>Calendario</p>
                </a></td>
            <td width="60"><a href="">
                    <img src="commons/images/icons/photos.png" alt="Contacts" width="60">
                    <p>Fotos</p>
                </a></td>
            <td width="60"><a href="AOORAMaps/">
                    <img src="commons/images/icons/maps.png" alt="Contacts" width="60">
                    <p>M&aacute;pas</p>
                </a></td>
            <td width="60"><a href="AOORADraw/">
                    <img src="commons/images/icons/freeform.png" alt="Contacts" width="60">
                    <p>AOORADraw</p>
                </a></td>
            <td width="60"><a href="">
                    <img src="commons/images/icons/account.png" alt="Contacts" width="60">
                    <p>Persona</p>
                </a></td>
        </tr>
        <tr>
            <td width="60"><a href="">
                    <img src="commons/images/icons/health.png" alt="Contacts" width="60">
                    <p>Sal&uacute;d</p>
                </a></td>
            <td width="60"><a href="AOORAHZA/">
                    <img src="commons/images/icons/HZS.png" alt="Contacts" width="60">
                    <p>HZA</p>
                </a></td>
            <td width="60"><a href="AOORAWeather/">
                    <img src="commons/images/icons/weather.png" alt="Contacts" width="60">
                    <p>Tiempo</p>
                </a></td>
            <td width="60"><a href="AOORACalculator/">
                    <img src="commons/images/icons/calculator.png" alt="Contacts" width="60">
                    <p>C&aacute;lculadora</p>
                </a></td>
            <td width="60"><a href="AOORASpa/">
                    <img src="commons/images/icons/voice recorder.png" alt="Contacts" width="60">
                    <p>SPA</p>
                </a></td>
            <td width="60"><a href="">
                    <img src="commons/images/icons/database.png" alt="Contacts" width="60">
                    <p>Base de dados</p>
                </a></td>
        </tr>
    </table>
</body>

</html>