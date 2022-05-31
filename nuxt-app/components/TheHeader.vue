<template>
    <b-container fluid>
        <b-img-lazy src="~/static/img/logo_150_150.png" class="float-left mt-1" width="50" height="50">
        </b-img-lazy>
        <b-row class="pt-2 align-middle" align-h="end">
            <b-col cols="6" class="mt-2">
                ERC20代币实现买、卖功能<b-link href="https://mshk.top">https://mshk.top</b-link>
            </b-col>
            <b-col cols="6" class="text-right">
                <Wallet />
            </b-col>
        </b-row>
    </b-container>
</template>
<script>
export default {
    name: 'TheHeader',
}
</script>